#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { releaseChangelog, releaseVersion } from 'nx/release/index.js';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { syncJsrJson } from '../../packages/sync-jsr-json/src/index.ts';

function createDraftRelease(tag: string, notesPath: string): void {
  execSync(
    `gh release create "${tag}" --draft --title "${tag}" --notes-file "${notesPath}" --target "${process.env.GITHUB_SHA ?? 'HEAD'}"`,
    { stdio: 'inherit' },
  );
}

/**
 * Type guard for exec sync errors with status code
 */
function isExecError(
  error: unknown,
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
 * 4. Generates changelogs and creates draft GitHub releases
 *
 * Publishing is handled separately by the publish workflow,
 * which is triggered when a draft release is published.
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
  await syncJsrJson({ dryRun: options.dryRun });

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

  // Step 4: Generate changelogs and create draft GitHub releases
  console.log(
    '\n4️⃣  Generating changelogs and creating draft GitHub releases...',
  );
  const changelogResult = await releaseChangelog({
    createRelease: false,
    dryRun: options.dryRun,
    verbose: options.verbose,
    version: workspaceVersion,
    versionData: projectsVersionData,
  });

  if (!options.dryRun && changelogResult.projectChangelogs) {
    const notesDir = await mkdtemp(join(tmpdir(), 'prefer-jsr-release-notes-'));

    for (const [projectName, changelog] of Object.entries(
      changelogResult.projectChangelogs,
    )) {
      const tag = changelog.releaseVersion.gitTag;
      const notesPath = join(notesDir, `${projectName}.md`);

      await writeFile(notesPath, changelog.contents, 'utf8');

      console.log(`\n   - Creating draft GitHub release for ${tag}...`);
      createDraftRelease(tag, notesPath);
    }
  }

  console.log('\n✅ Version and changelog process completed successfully!');
  console.log(
    '📝 Note: Publishing to npm and JSR will be triggered when a draft GitHub release is published.',
  );

  process.exit(0);
})();
