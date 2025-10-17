#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { releaseChangelog, releaseVersion } from 'nx/release/index.js';

/**
 * Type guard for exec sync errors with status code
 */
function isExecError(
  error: unknown
): error is Error & { code?: string; status?: number } {
  return error instanceof Error;
}

/**
 * Version and changelog script for CI
 *
 * This script:
 * 1. Runs nx release version to update package.json files
 * 2. Syncs jsr.json versions to match package.json
 * 3. Amends the release commit to include jsr.json changes
 * 4. Generates changelogs and creates GitHub releases
 *
 * Publishing is handled separately by the publish workflow
 * which is triggered when GitHub releases are created.
 */
(async () => {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run') || args.includes('-d'),
    firstRelease: args.includes('--first-release'),
    verbose: args.includes('--verbose'),
    version: args.find((arg) => arg.startsWith('--version='))?.split('=')[1],
  };

  console.log('\n📦 Starting version and changelog process...\n');

  // Step 1: Run nx release version
  console.log('1️⃣  Versioning packages...');
  const { projectsVersionData, workspaceVersion } = await releaseVersion({
    dryRun: options.dryRun,
    firstRelease: options.firstRelease,
    specifier: options.version,
    verbose: options.verbose,
  });

  if (!projectsVersionData || Object.keys(projectsVersionData).length === 0) {
    console.log('\n✅ No version changes detected. Process complete.');
    process.exit(0);
  }

  // Step 2: Sync jsr.json versions with package.json
  console.log('\n2️⃣  Syncing JSR versions...');
  syncJsrVersions(options.dryRun);

  // Step 3: Amend the release commit to include jsr.json changes (if not dry run)
  if (!options.dryRun) {
    console.log('\n3️⃣  Amending release commit with JSR version updates...');
    try {
      execSync('git add packages/*/jsr.json', { stdio: 'pipe' });
      // Check if there are staged changes
      try {
        execSync('git diff --staged --quiet', { stdio: 'pipe' });
      } catch (diffError: unknown) {
        // If git diff --staged --quiet exits with 1, there are changes to commit
        if (isExecError(diffError) && diffError.status === 1) {
          execSync('git commit --amend --no-edit', { stdio: 'inherit' });
          console.log('   ✓ Release commit amended with jsr.json changes');
        }
      }
    } catch (error: unknown) {
      const message = isExecError(error) ? error.message : String(error);
      console.warn('   ⚠️  Warning: Could not amend commit:', message);
    }
  }

  // Step 4: Generate changelogs and create GitHub releases
  console.log('\n4️⃣  Generating changelogs and creating GitHub releases...');
  await releaseChangelog({
    dryRun: options.dryRun,
    verbose: options.verbose,
    version: workspaceVersion,
    versionData: projectsVersionData,
  });

  console.log('\n✅ Version and changelog process completed successfully!');
  console.log(
    '📝 Note: Publishing to npm and JSR will be triggered automatically when GitHub releases are created.'
  );

  process.exit(0);
})();

/**
 * Sync jsr.json versions to match package.json versions
 */
function syncJsrVersions(dryRun: boolean): void {
  const packagesDir = join(process.cwd(), 'packages');
  const packages = readdirSync(packagesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  let syncedCount = 0;

  for (const pkg of packages) {
    const packageJsonPath = join(packagesDir, pkg, 'package.json');
    const jsrJsonPath = join(packagesDir, pkg, 'jsr.json');

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const jsrJson = JSON.parse(readFileSync(jsrJsonPath, 'utf8'));
      let updated = false;

      // Sync main version
      if (packageJson.version !== jsrJson.version) {
        console.log(
          `   📝 Updating ${pkg}/jsr.json: ${jsrJson.version} → ${packageJson.version}`
        );
        jsrJson.version = packageJson.version;
        updated = true;
      }

      // Sync sub-dependency versions in imports
      if (jsrJson.imports && typeof jsrJson.imports === 'object') {
        for (const [dep, jsrImport] of Object.entries(jsrJson.imports)) {
          // Only handle jsr: imports
          const match = /^jsr:@prefer-jsr\/(\w+)@\^?[\d\.]+/.exec(jsrImport);
          if (match) {
            const depName = match[1];
            // Find the actual package.json for the dependency
            const depPkgPath = join(packagesDir, depName, 'package.json');
            try {
              const depPkgJson = JSON.parse(readFileSync(depPkgPath, 'utf8'));
              const currentVersion = depPkgJson.version;
              const newImport = `jsr:@prefer-jsr/${depName}@^${currentVersion}`;
              if (jsrJson.imports[dep] !== newImport) {
                console.log(
                  `   📝 Updating ${pkg}/jsr.json imports[${dep}]: ${jsrJson.imports[dep]} → ${newImport}`
                );
                jsrJson.imports[dep] = newImport;
                updated = true;
              }
            } catch (depErr) {
              // Ignore if dep package.json doesn't exist
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
      }
    } catch (error: unknown) {
      // Skip if files don't exist
      if (isExecError(error) && error.code !== 'ENOENT') {
        console.warn(`   ⚠️  Warning: Could not sync ${pkg}:`, error);
      }
    }
  }

  if (syncedCount === 0) {
    console.log('   ✓ JSR versions already in sync');
  } else {
    console.log(
      `   ✓ Synced ${syncedCount} JSR ${
        syncedCount === 1 ? 'version' : 'versions'
      }`
    );
  }
}
