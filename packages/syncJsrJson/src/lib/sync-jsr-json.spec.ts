import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  mkdirSync,
  rmSync,
  writeFileSync,
  readFileSync,
  cpSync,
  existsSync,
} from 'node:fs';
import { join } from 'node:path';
import { syncJsrJson } from './sync-jsr-json.js';

function setupFixture(fixtureName: string, testDir: string): string {
  const fixtureDir = join(__dirname, '__fixtures__', fixtureName, 'before');
  const packagesDir = join(testDir, 'packages');

  if (!existsSync(fixtureDir)) {
    throw new Error(`Fixture not found: ${fixtureDir}`);
  }

  mkdirSync(testDir, { recursive: true });
  cpSync(fixtureDir, testDir, { recursive: true });

  return packagesDir;
}

describe('syncJsrJson', () => {
  describe('using fixtures', () => {
    it('should sync single package version', async () => {
      const testDir = join(process.cwd(), 'tmp', 'fixture-single');
      const packagesDir = setupFixture('single-package', testDir);

      try {
        const result = await syncJsrJson({ packagesDir });

        expect(result.syncedCount).toBe(1);
        expect(result.syncedPackages[0].packageName).toBe('@test/single-pkg');
        expect(result.syncedPackages[0].changes).toContain(
          'version: 1.0.0 → 2.0.0'
        );
        expect(result.syncedPackages[0].changes).toContain(
          'imports[@eslint/json]: jsr:@eslint/json@^0.4.0 → jsr:@eslint/json@^0.5.0'
        );

        const expectedJsrJson = JSON.parse(
          readFileSync(
            join(
              __dirname,
              '__fixtures__',
              'single-package',
              'after',
              'packages',
              'test-pkg',
              'jsr.json'
            ),
            'utf8'
          )
        );

        const actualJsrJson = JSON.parse(
          readFileSync(join(packagesDir, 'test-pkg', 'jsr.json'), 'utf8')
        );
        expect(actualJsrJson).toEqual(expectedJsrJson);
      } finally {
        rmSync(testDir, { recursive: true, force: true });
      }
    });

    it('should handle multiple packages with version sync and all constraint types', async () => {
      const testDir = join(process.cwd(), 'tmp', 'fixture-multi');
      const packagesDir = setupFixture('multiple-packages', testDir);

      try {
        const result = await syncJsrJson({ packagesDir });

        expect(result.syncedCount).toBe(3);
        expect(result.syncedPackages.map((p) => p.packageName).sort()).toEqual([
          '@test/pkg1',
          'pkg2',
          'pkg3',
        ]);

        const pkg1Sync = result.syncedPackages.find(
          (p) => p.packageName === '@test/pkg1'
        );
        const pkg2Sync = result.syncedPackages.find(
          (p) => p.packageName === 'pkg2'
        );
        const pkg3Sync = result.syncedPackages.find(
          (p) => p.packageName === 'pkg3'
        );

        expect(pkg1Sync?.changes).toContain('version: 0.9.0 → 1.0.0');
        expect(pkg2Sync?.changes).toContain(
          'imports[pkg1]: jsr:@test/pkg1@0.9.0 → jsr:@test/pkg1@1.0.0'
        );
        expect(pkg2Sync?.changes).toContain(
          'imports[@external/tilde-pkg]: jsr:@external/tilde-pkg@~1.5.0 → jsr:@external/tilde-pkg@~1.8.0'
        );
        expect(pkg3Sync?.changes).toContain('version: 2.9.0 → 3.0.0');
        expect(pkg3Sync?.changes).toContain(
          'imports[pkg1]: jsr:@test/pkg1@^0.9.0 → jsr:@test/pkg1@^1.0.0'
        );
      } finally {
        rmSync(testDir, { recursive: true, force: true });
      }
    });

    it('should not write files in dry-run mode', async () => {
      const testDir = join(process.cwd(), 'tmp', 'fixture-dry-run');
      const packagesDir = setupFixture('dry-run-test', testDir);

      try {
        const result = await syncJsrJson({ packagesDir, dryRun: true });

        expect(result.syncedCount).toBe(1);

        // Read the expected result from the "after" fixture (should be unchanged)
        const expectedJsrJson = JSON.parse(
          readFileSync(
            join(
              __dirname,
              '__fixtures__',
              'dry-run-test',
              'after',
              'packages',
              'test-pkg',
              'jsr.json'
            ),
            'utf8'
          )
        );

        // Verify the actual result matches the expected "after" state (unchanged)
        const actualJsrJson = JSON.parse(
          readFileSync(join(packagesDir, 'test-pkg', 'jsr.json'), 'utf8')
        );
        expect(actualJsrJson).toEqual(expectedJsrJson);
        expect(actualJsrJson.version).toBe('1.0.0'); // Should not be updated
      } finally {
        rmSync(testDir, { recursive: true, force: true });
      }
    });

    it('should work with async version', async () => {
      const testDir = join(process.cwd(), 'tmp', 'fixture-async');
      const packagesDir = setupFixture('single-package', testDir);

      try {
        const { syncJsrJson } = await import('./sync-jsr-json.js');
        const result = await syncJsrJson({ packagesDir });

        expect(result.syncedCount).toBe(1);
        expect(result.syncedPackages[0].packageName).toBe('@test/single-pkg');

        // Read the expected result from the "after" fixture
        const expectedJsrJson = JSON.parse(
          readFileSync(
            join(
              __dirname,
              '__fixtures__',
              'single-package',
              'after',
              'packages',
              'test-pkg',
              'jsr.json'
            ),
            'utf8'
          )
        );

        // Verify the actual result matches the expected "after" state
        const actualJsrJson = JSON.parse(
          readFileSync(join(packagesDir, 'test-pkg', 'jsr.json'), 'utf8')
        );
        expect(actualJsrJson).toEqual(expectedJsrJson);
        expect(actualJsrJson.version).toBe('2.0.0');
      } finally {
        rmSync(testDir, { recursive: true, force: true });
      }
    });
  });

  describe('specific behaviors', () => {
    const testDir = join(process.cwd(), 'tmp', 'sync-behavior-test');
    const packagesDir = join(testDir, 'packages');

    beforeEach(() => {
      mkdirSync(packagesDir, { recursive: true });
    });

    afterEach(() => {
      rmSync(testDir, { recursive: true, force: true });
    });

    it('should skip packages without required files', async () => {
      const pkg1Dir = join(packagesDir, 'pkg1');
      const pkg2Dir = join(packagesDir, 'pkg2');
      mkdirSync(pkg1Dir, { recursive: true });
      mkdirSync(pkg2Dir, { recursive: true });

      writeFileSync(
        join(pkg1Dir, 'package.json'),
        JSON.stringify({ version: '1.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkg2Dir, 'jsr.json'),
        JSON.stringify({ version: '1.0.0' }, null, 2)
      );

      const result = await syncJsrJson({ packagesDir });
      expect(result.syncedCount).toBe(0);
    });

    it('should export custom error classes', async () => {
      const { FileSystemError, JsonParseError } = await import(
        './sync-jsr-json.js'
      );

      const fsError = new FileSystemError('test error', '/path/to/file');
      expect(fsError.name).toBe('FileSystemError');

      const jsonError = new JsonParseError('parse error', '/path/to/json');
      expect(jsonError.name).toBe('JsonParseError');
    });
  });
});
