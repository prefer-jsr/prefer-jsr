import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface SyncJsrJsonOptions {
  /**
   * Whether to run in dry-run mode (don't write files)
   * @default false
   */
  dryRun?: boolean;
  /**
   * Custom logger function for output
   */
  log?: (message: string) => void;
  /**
   * The directory containing the packages to sync
   * @default process.cwd() + '/packages'
   */
  packagesDir?: string;
}

export interface SyncResult {
  /**
   * Number of packages that were synced
   */
  syncedCount: number;
  /**
   * Details of packages that were synced
   */
  syncedPackages: Array<{
    changes: string[];
    packageName: string;
  }>;
}

interface JsrImportInfo {
  packageName: string;
  version: string;
  versionPrefix: string;
}

interface JsrJson {
  imports?: Record<string, string | unknown>;
  name?: string;
  version?: string;
}

interface PackageJson {
  dependencies?: Record<string, string>;
  name?: string;
  version?: string;
}

/**
 * Custom error for file system operations
 */
export class FileSystemError extends Error {
  public override readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'FileSystemError';
    this.cause = cause;
  }
}

/**
 * Custom error for JSON parsing
 */
export class JsonParseError extends Error {
  public override readonly cause?: Error;
  public readonly path: string;

  constructor(message: string, path: string, cause?: Error) {
    super(message);
    this.name = 'JsonParseError';
    this.cause = cause;
    this.path = path;
  }
}

/**
 * Sync jsr.json versions to match package.json versions
 *
 * This function:
 * 1. Reads all packages in the packages directory
 * 2. Syncs the version in jsr.json to match package.json
 * 3. Syncs JSR import versions for any local dependencies
 *
 * @param options - Configuration options
 * @returns Promise resolving to result with count and details of synced packages
 */
export async function syncJsrJson(
  options: SyncJsrJsonOptions = {}
): Promise<SyncResult> {
  const {
    dryRun = false,
    log = console.log,
    packagesDir = join(process.cwd(), 'packages'),
  } = options;

  const packages = await getPackageNames(packagesDir);
  const packageMap = await buildPackageMap(packages, packagesDir);

  const syncResults = await Promise.all(
    packages.map((pkg) =>
      syncPackage(pkg, packageMap, packagesDir, log, dryRun)
    )
  );

  const syncedPackages = syncResults.filter(
    (result): result is NonNullable<typeof result> => result !== null
  );

  return processSyncResults(syncedPackages, log);
}

/**
 * Build a map of package names to their versions for O(1) lookups
 */
async function buildPackageMap(
  packages: string[],
  packagesDir: string
): Promise<Map<string, string>> {
  const packageInfos = (
    await Promise.all(packages.map((pkg) => readPackageInfo(pkg, packagesDir)))
  ).filter((pkg): pkg is NonNullable<typeof pkg> => pkg !== null);

  return new Map(packageInfos.map(({ name, version }) => [name, version]));
}

/**
 * Calculate import updates for a single dependency
 */
function calculateImportUpdate(
  dep: string,
  importValue: unknown,
  packageMap: Map<string, string>,
  packageJsonDependencies?: Record<string, string>
): null | { dependency: string; from: string; to: string } {
  const stringValue = typeof importValue === 'string' ? importValue : '';
  const parsedImport = parseJsrImport(stringValue);

  if (!parsedImport) return null;

  const monorepoVersion = packageMap.get(parsedImport.packageName);
  if (monorepoVersion) {
    const newImport = createJsrImport(
      parsedImport.packageName,
      parsedImport.versionPrefix,
      monorepoVersion
    );

    return stringValue !== newImport
      ? { dependency: dep, from: stringValue, to: newImport }
      : null;
  }

  const packageJsonVersion = packageJsonDependencies?.[dep];
  if (packageJsonVersion && parsedImport.packageName === dep) {
    const cleanVersion = packageJsonVersion.replace(/^[\^~]/, '');
    const newImport = createJsrImport(
      parsedImport.packageName,
      parsedImport.versionPrefix,
      cleanVersion
    );

    return stringValue !== newImport
      ? { dependency: dep, from: stringValue, to: newImport }
      : null;
  }

  return null;
}

/**
 * Calculate all import updates
 */
function calculateImportUpdates(
  imports: Record<string, string | unknown>,
  packageMap: Map<string, string>,
  packageJsonDependencies?: Record<string, string>
): Array<{ dependency: string; from: string; to: string }> {
  return Object.entries(imports)
    .map(([dep, importValue]) =>
      calculateImportUpdate(
        dep,
        importValue,
        packageMap,
        packageJsonDependencies
      )
    )
    .filter((update): update is NonNullable<typeof update> => update !== null);
}

/**
 * Create log messages for import updates
 */
function createImportLogMessages(
  pkg: string,
  updates: Array<{ dependency: string; from: string; to: string }>
): string[] {
  return updates.map(
    ({ dependency, from, to }) =>
      `   📝 Updating ${pkg}/jsr.json imports[${dependency}]: ${from} → ${to}`
  );
}

/**
 * Create a JSR import string with the given package name, version prefix, and version
 */
function createJsrImport(
  packageName: string,
  versionPrefix: string,
  version: string
): string {
  return `jsr:${packageName}@${versionPrefix}${version}`;
}

/**
 * Create a summary message for sync results
 */
function createSummaryMessage(syncedCount: number): string {
  return syncedCount === 0
    ? '   ✓ JSR versions already in sync'
    : `   ✓ Synced ${syncedCount} JSR ${
        syncedCount === 1 ? 'version' : 'versions'
      }`;
}

/**
 * Convert updates to changes and updatedImports format
 */
function formatImportUpdates(
  updates: Array<{ dependency: string; from: string; to: string }>
): { changes: string[]; updatedImports: Record<string, string> } {
  const changes = updates.map(
    ({ dependency, from, to }) => `imports[${dependency}]: ${from} → ${to}`
  );

  const updatedImports = Object.fromEntries(
    updates.map(({ dependency, to }) => [dependency, to])
  );

  return { changes, updatedImports };
}

/**
 * Get directory names from a packages directory (async)
 */
async function getPackageNames(packagesDir: string): Promise<string[]> {
  const dirents = await readdir(packagesDir, { withFileTypes: true });
  return dirents
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

/**
 * Parse a JSR import string to extract package name and version constraint
 * Supports: ^1.0.0, ~1.0.0, 1.0.0, >=1.0.0, etc.
 */
function parseJsrImport(importValue: string): JsrImportInfo | null {
  if (typeof importValue !== 'string') {
    return null;
  }

  const match = /^jsr:(@?[\w-]+\/[\w-]+)@([\^~><=]*)([\d.]+)/.exec(importValue);

  if (!match) {
    return null;
  }

  return {
    packageName: match[1],
    version: match[3],
    versionPrefix: match[2] || '',
  };
}

/**
 * Read and parse a package.json file async
 */
const readPackageInfo = async (pkg: string, packagesDir: string) => {
  try {
    const packageJsonPath = join(packagesDir, pkg, 'package.json');
    const content = await readFile(packageJsonPath, 'utf8');
    const packageJson: PackageJson = JSON.parse(content);
    return packageJson.name && packageJson.version
      ? { name: packageJson.name, version: packageJson.version }
      : null;
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return null;
    }
    if (error instanceof SyntaxError) {
      throw new JsonParseError(
        `Invalid JSON in read package.json for ${pkg}`,
        join(packagesDir, pkg, 'package.json'),
        error
      );
    }
    if (error instanceof Error) {
      throw new FileSystemError(
        `Failed to read package.json for ${pkg}: ${join(
          packagesDir,
          pkg,
          'package.json'
        )}`,
        error
      );
    }
    throw error;
  }
};

/**
 * Process packages and return sync results
 */
function processSyncResults<
  T extends { changes: string[]; packageName: string }
>(syncedPackages: T[], log: (message: string) => void): SyncResult {
  const syncedCount = syncedPackages.length;
  log(createSummaryMessage(syncedCount));
  return { syncedCount, syncedPackages };
}

/**
 * Sync all JSR imports in a package based on monorepo package versions and package.json dependencies (async version)
 */
async function syncImports(
  pkg: string,
  imports: Record<string, string | unknown>,
  packageMap: Map<string, string>,
  log: (message: string) => void,
  packageJsonDependencies?: Record<string, string>
): Promise<{ changes: string[]; updatedImports: Record<string, string> }> {
  const updates = calculateImportUpdates(
    imports,
    packageMap,
    packageJsonDependencies
  );

  createImportLogMessages(pkg, updates).forEach(log);

  return formatImportUpdates(updates);
}

/**
 * Sync a single package's jsr.json with its package.json (async primary implementation)
 */
async function syncPackage(
  pkg: string,
  packageMap: Map<string, string>,
  packagesDir: string,
  log: (message: string) => void,
  dryRun: boolean
): Promise<null | { changes: string[]; packageName: string }> {
  const packageJsonPath = join(packagesDir, pkg, 'package.json');
  const jsrJsonPath = join(packagesDir, pkg, 'jsr.json');

  try {
    const [packageJsonContent, jsrJsonContent] = await Promise.all([
      readFile(packageJsonPath, 'utf8'),
      readFile(jsrJsonPath, 'utf8'),
    ]);

    const packageJson: PackageJson = JSON.parse(packageJsonContent);
    const jsrJson: JsrJson = JSON.parse(jsrJsonContent);

    const changes: string[] = [];

    if (packageJson.version && packageJson.version !== jsrJson.version) {
      log(
        `   📝 Updating ${pkg}/jsr.json: ${jsrJson.version} → ${packageJson.version}`
      );
      changes.push(`version: ${jsrJson.version} → ${packageJson.version}`);
      jsrJson.version = packageJson.version;
    }

    if (jsrJson.imports && typeof jsrJson.imports === 'object') {
      const importChanges = await syncImports(
        pkg,
        jsrJson.imports,
        packageMap,
        log,
        packageJson.dependencies
      );
      changes.push(...importChanges.changes);
      Object.assign(jsrJson.imports, importChanges.updatedImports);
    }

    if (changes.length > 0) {
      const actualPackageName = packageJson.name || jsrJson.name || pkg;

      if (!dryRun) {
        await writeFile(
          jsrJsonPath,
          JSON.stringify(jsrJson, null, 2) + '\n',
          'utf8'
        );
      }
      return { changes, packageName: actualPackageName };
    }

    return null;
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return null;
    }

    if (error instanceof SyntaxError) {
      throw new JsonParseError(
        `Invalid JSON in package files for ${pkg}`,
        packageJsonPath,
        error
      );
    }

    if (error instanceof Error) {
      throw new FileSystemError(
        `Failed to sync package ${pkg}: ${packageJsonPath}`,
        error
      );
    }

    throw error;
  }
}
