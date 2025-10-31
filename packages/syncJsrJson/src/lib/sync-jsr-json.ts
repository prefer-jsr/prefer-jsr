import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
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
  version?: string;
}

interface PackageJson {
  name?: string;
  version?: string;
}

/**
 * Custom error for file system operations
 */
export class FileSystemError extends Error {
  public override readonly cause?: Error;
  public readonly path: string;

  constructor(message: string, path: string, cause?: Error) {
    super(message);
    this.name = 'FileSystemError';
    this.cause = cause;
    this.path = path;
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
 * @returns Result with count and details of synced packages
 */
export function syncJsrJson(options: SyncJsrJsonOptions = {}): SyncResult {
  const {
    dryRun = false,
    log = console.log,
    packagesDir = join(process.cwd(), 'packages'),
  } = options;

  const packages = readdirSync(packagesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const syncedPackages = packages
    .map((pkg) => syncPackage(pkg, packages, packagesDir, log, dryRun))
    .filter((result): result is NonNullable<typeof result> => result !== null);

  const syncedCount = syncedPackages.length;

  if (syncedCount === 0) {
    log('   ✓ JSR versions already in sync');
  } else {
    log(
      `   ✓ Synced ${syncedCount} JSR ${
        syncedCount === 1 ? 'version' : 'versions'
      }`
    );
  }

  return { syncedCount, syncedPackages };
}

/**
 * Async version: Sync jsr.json versions to match package.json versions
 *
 * This function:
 * 1. Reads all packages in the packages directory
 * 2. Syncs the version in jsr.json to match package.json
 * 3. Syncs JSR import versions for any local dependencies
 *
 * @param options - Configuration options
 * @returns Promise resolving to result with count and details of synced packages
 */
export async function syncJsrJsonAsync(
  options: SyncJsrJsonOptions = {}
): Promise<SyncResult> {
  const {
    dryRun = false,
    log = console.log,
    packagesDir = join(process.cwd(), 'packages'),
  } = options;

  const dirents = await readdir(packagesDir, { withFileTypes: true });
  const packages = dirents
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const syncResults = await Promise.all(
    packages.map((pkg) =>
      syncPackageAsync(pkg, packages, packagesDir, log, dryRun)
    )
  );

  const syncedPackages = syncResults.filter(
    (result): result is NonNullable<typeof result> => result !== null
  );

  const syncedCount = syncedPackages.length;

  if (syncedCount === 0) {
    log('   ✓ JSR versions already in sync');
  } else {
    log(
      `   ✓ Synced ${syncedCount} JSR ${
        syncedCount === 1 ? 'version' : 'versions'
      }`
    );
  }

  return { syncedCount, syncedPackages };
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
 * Find a local package by name from the list of packages
 */
function findLocalPackage(
  packageName: string,
  packages: string[],
  packagesDir: string
): null | { version: string } {
  for (const localPkg of packages) {
    try {
      const localPkgJsonPath = join(packagesDir, localPkg, 'package.json');
      const localPkgJson: PackageJson = JSON.parse(
        readFileSync(localPkgJsonPath, 'utf8')
      );

      if (localPkgJson.name === packageName && localPkgJson.version) {
        return { version: localPkgJson.version };
      }
    } catch (error) {
      // Ignore if package.json doesn't exist or can't be read
      if (
        error instanceof Error &&
        'code' in error &&
        error.code !== 'ENOENT'
      ) {
        throw new FileSystemError(
          `Failed to read package.json for ${localPkg}`,
          join(packagesDir, localPkg, 'package.json'),
          error
        );
      }
    }
  }

  return null;
}

/**
 * Async version: Find a local package by name from the list of packages
 */
async function findLocalPackageAsync(
  packageName: string,
  packages: string[],
  packagesDir: string
): Promise<null | { version: string }> {
  for (const localPkg of packages) {
    try {
      const localPkgJsonPath = join(packagesDir, localPkg, 'package.json');
      const content = await readFile(localPkgJsonPath, 'utf8');
      const localPkgJson: PackageJson = JSON.parse(content);

      if (localPkgJson.name === packageName && localPkgJson.version) {
        return { version: localPkgJson.version };
      }
    } catch (error) {
      // Ignore if package.json doesn't exist
      if (
        error instanceof Error &&
        'code' in error &&
        (error as NodeJS.ErrnoException).code !== 'ENOENT'
      ) {
        throw new FileSystemError(
          `Failed to read package.json for ${localPkg}`,
          join(packagesDir, localPkg, 'package.json'),
          error
        );
      }
    }
  }

  return null;
}

/**
 * Parse a JSR import string to extract package name and version constraint
 * Supports: ^1.0.0, ~1.0.0, 1.0.0, >=1.0.0, etc.
 */
function parseJsrImport(importValue: string): JsrImportInfo | null {
  if (typeof importValue !== 'string') {
    return null;
  }

  // Match jsr: imports with various version constraints
  // Supports: ^, ~, exact versions, >, >=, <, <=, and ranges
  const match = /^jsr:(@?[\w-]+\/[\w-]+)@([\^~><=]*)([\d.]+)/.exec(importValue);

  if (!match) {
    return null;
  }

  return {
    packageName: match[1],
    version: match[3],
    versionPrefix: match[2] || '^', // Default to caret if no prefix
  };
}

/**
 * Sync all JSR imports in a package
 */
function syncImports(
  pkg: string,
  imports: Record<string, string | unknown>,
  allPackages: string[],
  packagesDir: string,
  log: (message: string) => void
): { changes: string[]; updatedImports: Record<string, string> } {
  const changes: string[] = [];
  const updatedImports: Record<string, string> = {};

  for (const [dep, importValue] of Object.entries(imports)) {
    const parsedImport = parseJsrImport(
      typeof importValue === 'string' ? importValue : ''
    );

    if (!parsedImport) {
      continue;
    }

    const localPackage = findLocalPackage(
      parsedImport.packageName,
      allPackages,
      packagesDir
    );

    if (localPackage) {
      const newImport = createJsrImport(
        parsedImport.packageName,
        parsedImport.versionPrefix,
        localPackage.version
      );

      if (importValue !== newImport) {
        log(
          `   📝 Updating ${pkg}/jsr.json imports[${dep}]: ${importValue} → ${newImport}`
        );
        changes.push(`imports[${dep}]: ${importValue} → ${newImport}`);
        updatedImports[dep] = newImport;
      }
    }
  }

  return { changes, updatedImports };
}

/**
 * Async version: Sync all JSR imports in a package
 */
async function syncImportsAsync(
  pkg: string,
  imports: Record<string, string | unknown>,
  allPackages: string[],
  packagesDir: string,
  log: (message: string) => void
): Promise<{ changes: string[]; updatedImports: Record<string, string> }> {
  const changes: string[] = [];
  const updatedImports: Record<string, string> = {};

  for (const [dep, importValue] of Object.entries(imports)) {
    const parsedImport = parseJsrImport(
      typeof importValue === 'string' ? importValue : ''
    );

    if (!parsedImport) {
      continue;
    }

    const localPackage = await findLocalPackageAsync(
      parsedImport.packageName,
      allPackages,
      packagesDir
    );

    if (localPackage) {
      const newImport = createJsrImport(
        parsedImport.packageName,
        parsedImport.versionPrefix,
        localPackage.version
      );

      if (importValue !== newImport) {
        log(
          `   📝 Updating ${pkg}/jsr.json imports[${dep}]: ${importValue} → ${newImport}`
        );
        changes.push(`imports[${dep}]: ${importValue} → ${newImport}`);
        updatedImports[dep] = newImport;
      }
    }
  }

  return { changes, updatedImports };
}

/**
 * Sync a single package's jsr.json with its package.json
 */
function syncPackage(
  pkg: string,
  allPackages: string[],
  packagesDir: string,
  log: (message: string) => void,
  dryRun: boolean
): null | { changes: string[]; packageName: string } {
  const packageJsonPath = join(packagesDir, pkg, 'package.json');
  const jsrJsonPath = join(packagesDir, pkg, 'jsr.json');

  try {
    const packageJson: PackageJson = JSON.parse(
      readFileSync(packageJsonPath, 'utf8')
    );
    const jsrJson: JsrJson = JSON.parse(readFileSync(jsrJsonPath, 'utf8'));

    const changes: string[] = [];

    // Sync main version
    if (packageJson.version && packageJson.version !== jsrJson.version) {
      log(
        `   📝 Updating ${pkg}/jsr.json: ${jsrJson.version} → ${packageJson.version}`
      );
      changes.push(`version: ${jsrJson.version} → ${packageJson.version}`);
      jsrJson.version = packageJson.version;
    }

    // Sync import versions
    if (jsrJson.imports && typeof jsrJson.imports === 'object') {
      const importChanges = syncImports(
        pkg,
        jsrJson.imports,
        allPackages,
        packagesDir,
        log
      );
      changes.push(...importChanges.changes);
      Object.assign(jsrJson.imports, importChanges.updatedImports);
    }

    // Write changes if any
    if (changes.length > 0) {
      if (!dryRun) {
        writeFileSync(
          jsrJsonPath,
          JSON.stringify(jsrJson, null, 2) + '\n',
          'utf8'
        );
      }
      return { changes, packageName: pkg };
    }

    return null;
  } catch (error) {
    // Skip if files don't exist
    if (
      error instanceof Error &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return null;
    }

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      throw new JsonParseError(
        `Invalid JSON in package files for ${pkg}`,
        packageJsonPath,
        error
      );
    }

    // Handle file system errors
    if (error instanceof Error) {
      throw new FileSystemError(
        `Failed to sync package ${pkg}`,
        packageJsonPath,
        error
      );
    }

    // Rethrow if unknown error type
    throw error;
  }
}

/**
 * Async version: Sync a single package's jsr.json with its package.json
 */
async function syncPackageAsync(
  pkg: string,
  allPackages: string[],
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

    // Sync main version
    if (packageJson.version && packageJson.version !== jsrJson.version) {
      log(
        `   📝 Updating ${pkg}/jsr.json: ${jsrJson.version} → ${packageJson.version}`
      );
      changes.push(`version: ${jsrJson.version} → ${packageJson.version}`);
      jsrJson.version = packageJson.version;
    }

    // Sync import versions
    if (jsrJson.imports && typeof jsrJson.imports === 'object') {
      const importChanges = await syncImportsAsync(
        pkg,
        jsrJson.imports,
        allPackages,
        packagesDir,
        log
      );
      changes.push(...importChanges.changes);
      Object.assign(jsrJson.imports, importChanges.updatedImports);
    }

    // Write changes if any
    if (changes.length > 0) {
      if (!dryRun) {
        await writeFile(
          jsrJsonPath,
          JSON.stringify(jsrJson, null, 2) + '\n',
          'utf8'
        );
      }
      return { changes, packageName: pkg };
    }

    return null;
  } catch (error) {
    // Skip if files don't exist
    if (
      error instanceof Error &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return null;
    }

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      throw new JsonParseError(
        `Invalid JSON in package files for ${pkg}`,
        packageJsonPath,
        error
      );
    }

    // Handle file system errors
    if (error instanceof Error) {
      throw new FileSystemError(
        `Failed to sync package ${pkg}`,
        packageJsonPath,
        error
      );
    }

    // Rethrow if unknown error type
    throw error;
  }
}
