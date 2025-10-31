import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
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

  let syncedCount = 0;
  const syncedPackages: SyncResult['syncedPackages'] = [];

  for (const pkg of packages) {
    const packageJsonPath = join(packagesDir, pkg, 'package.json');
    const jsrJsonPath = join(packagesDir, pkg, 'jsr.json');

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const jsrJson = JSON.parse(readFileSync(jsrJsonPath, 'utf8'));
      let updated = false;
      const changes: string[] = [];

      // Sync main version
      if (packageJson.version !== jsrJson.version) {
        log(
          `   📝 Updating ${pkg}/jsr.json: ${jsrJson.version} → ${packageJson.version}`
        );
        changes.push(
          `version: ${jsrJson.version} → ${packageJson.version}`
        );
        jsrJson.version = packageJson.version;
        updated = true;
      }

      // Sync sub-dependency versions in imports
      if (jsrJson.imports && typeof jsrJson.imports === 'object') {
        for (const [dep, jsrImport] of Object.entries(jsrJson.imports)) {
          // Only handle jsr: imports with version specifiers
          const match = /^jsr:(@?[\w-]+\/[\w-]+)@\^?[\d.]+/.exec(
            jsrImport as string
          );
          if (match) {
            const fullPackageName = match[1];
            
            // Try to find a local package with this name
            // Check all directories in packagesDir
            for (const localPkg of packages) {
              const localPkgJsonPath = join(packagesDir, localPkg, 'package.json');
              try {
                const localPkgJson = JSON.parse(readFileSync(localPkgJsonPath, 'utf8'));
                
                // Check if this local package matches the import
                if (localPkgJson.name === fullPackageName) {
                  const currentVersion = localPkgJson.version;
                  const newImport = `jsr:${fullPackageName}@^${currentVersion}`;
                  
                  if (jsrJson.imports[dep] !== newImport) {
                    log(
                      `   📝 Updating ${pkg}/jsr.json imports[${dep}]: ${jsrJson.imports[dep]} → ${newImport}`
                    );
                    changes.push(
                      `imports[${dep}]: ${jsrJson.imports[dep]} → ${newImport}`
                    );
                    jsrJson.imports[dep] = newImport;
                    updated = true;
                  }
                  
                  break;
                }
              } catch {
                // Ignore if package.json doesn't exist or can't be read
              }
            }
          }
        }
      }

      if (updated) {
        if (!dryRun) {
          writeFileSync(
            jsrJsonPath,
            JSON.stringify(jsrJson, null, 2) + '\n',
            'utf8'
          );
        }
        syncedCount++;
        syncedPackages.push({ changes, packageName: pkg });
      }
    } catch (error: unknown) {
      // Skip if files don't exist
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code !== 'ENOENT'
      ) {
        log(`   ⚠️  Warning: Could not sync ${pkg}: ${error}`);
      }
    }
  }

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
