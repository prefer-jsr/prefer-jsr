import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { syncJsrJson } from './sync-jsr-json.js';

describe('syncJsrJson', () => {
  const testDir = join(process.cwd(), 'tmp', 'sync-jsr-json-test');
  const packagesDir = join(testDir, 'packages');

  beforeEach(() => {
    // Create test directory structure
    mkdirSync(packagesDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('basic version syncing', () => {
    it('should sync jsr.json version to match package.json', () => {
      // Setup
      const pkgDir = join(packagesDir, 'test-pkg');
      mkdirSync(pkgDir, { recursive: true });

      writeFileSync(
        join(pkgDir, 'package.json'),
        JSON.stringify({ name: 'test-pkg', version: '1.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkgDir, 'jsr.json'),
        JSON.stringify({ name: 'test-pkg', version: '0.9.0' }, null, 2)
      );

      // Execute
      const logs: string[] = [];
      const result = syncJsrJson({
        packagesDir,
        log: (msg) => logs.push(msg),
      });

      // Verify
      expect(result.syncedCount).toBe(1);
      expect(result.syncedPackages).toHaveLength(1);
      expect(result.syncedPackages[0].packageName).toBe('test-pkg');
      expect(result.syncedPackages[0].changes).toContain(
        'version: 0.9.0 → 1.0.0'
      );

      const updatedJsrJson = JSON.parse(
        readFileSync(join(pkgDir, 'jsr.json'), 'utf8')
      );
      expect(updatedJsrJson.version).toBe('1.0.0');
    });

    it('should not update if versions already match', () => {
      // Setup
      const pkgDir = join(packagesDir, 'test-pkg');
      mkdirSync(pkgDir, { recursive: true });

      writeFileSync(
        join(pkgDir, 'package.json'),
        JSON.stringify({ name: 'test-pkg', version: '1.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkgDir, 'jsr.json'),
        JSON.stringify({ name: 'test-pkg', version: '1.0.0' }, null, 2)
      );

      // Execute
      const logs: string[] = [];
      const result = syncJsrJson({
        packagesDir,
        log: (msg) => logs.push(msg),
      });

      // Verify
      expect(result.syncedCount).toBe(0);
      expect(result.syncedPackages).toHaveLength(0);
      expect(logs.some((log) => log.includes('already in sync'))).toBe(true);
    });
  });

  describe('dry-run mode', () => {
    it('should not write files in dry-run mode', () => {
      // Setup
      const pkgDir = join(packagesDir, 'test-pkg');
      mkdirSync(pkgDir, { recursive: true });

      writeFileSync(
        join(pkgDir, 'package.json'),
        JSON.stringify({ name: 'test-pkg', version: '2.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkgDir, 'jsr.json'),
        JSON.stringify({ name: 'test-pkg', version: '1.0.0' }, null, 2)
      );

      // Execute
      const result = syncJsrJson({
        packagesDir,
        dryRun: true,
      });

      // Verify
      expect(result.syncedCount).toBe(1);

      const jsrJson = JSON.parse(
        readFileSync(join(pkgDir, 'jsr.json'), 'utf8')
      );
      expect(jsrJson.version).toBe('1.0.0'); // Should not be updated
    });
  });

  describe('dependency imports syncing', () => {
    it('should sync @prefer-jsr dependency imports', () => {
      // Setup - Create two packages
      const pkg1Dir = join(packagesDir, 'pkg1');
      const pkg2Dir = join(packagesDir, 'pkg2');
      mkdirSync(pkg1Dir, { recursive: true });
      mkdirSync(pkg2Dir, { recursive: true });

      // pkg1 is a dependency
      writeFileSync(
        join(pkg1Dir, 'package.json'),
        JSON.stringify({ name: '@prefer-jsr/pkg1', version: '2.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkg1Dir, 'jsr.json'),
        JSON.stringify({ name: '@prefer-jsr/pkg1', version: '2.0.0' }, null, 2)
      );

      // pkg2 depends on pkg1 with outdated version
      writeFileSync(
        join(pkg2Dir, 'package.json'),
        JSON.stringify({ name: '@prefer-jsr/pkg2', version: '1.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkg2Dir, 'jsr.json'),
        JSON.stringify(
          {
            name: '@prefer-jsr/pkg2',
            version: '1.0.0',
            imports: {
              pkg1: 'jsr:@prefer-jsr/pkg1@^1.0.0',
            },
          },
          null,
          2
        )
      );

      // Execute
      const logs: string[] = [];
      const result = syncJsrJson({
        packagesDir,
        log: (msg) => logs.push(msg),
      });

      // Verify
      expect(result.syncedCount).toBe(1);
      expect(result.syncedPackages[0].packageName).toBe('pkg2');
      expect(result.syncedPackages[0].changes).toContain(
        'imports[pkg1]: jsr:@prefer-jsr/pkg1@^1.0.0 → jsr:@prefer-jsr/pkg1@^2.0.0'
      );

      const updatedJsrJson = JSON.parse(
        readFileSync(join(pkg2Dir, 'jsr.json'), 'utf8')
      );
      expect(updatedJsrJson.imports.pkg1).toBe('jsr:@prefer-jsr/pkg1@^2.0.0');
    });

    it('should handle imports without caret prefix', () => {
      // Setup
      const pkg1Dir = join(packagesDir, 'pkg1');
      const pkg2Dir = join(packagesDir, 'pkg2');
      mkdirSync(pkg1Dir, { recursive: true });
      mkdirSync(pkg2Dir, { recursive: true });

      writeFileSync(
        join(pkg1Dir, 'package.json'),
        JSON.stringify({ name: '@prefer-jsr/pkg1', version: '3.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkg1Dir, 'jsr.json'),
        JSON.stringify({ name: '@prefer-jsr/pkg1', version: '3.0.0' }, null, 2)
      );

      writeFileSync(
        join(pkg2Dir, 'package.json'),
        JSON.stringify({ name: '@prefer-jsr/pkg2', version: '1.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkg2Dir, 'jsr.json'),
        JSON.stringify(
          {
            name: '@prefer-jsr/pkg2',
            version: '1.0.0',
            imports: {
              pkg1: 'jsr:@prefer-jsr/pkg1@2.0.0',
            },
          },
          null,
          2
        )
      );

      // Execute
      syncJsrJson({
        packagesDir,
      });

      // Verify
      const updatedJsrJson = JSON.parse(
        readFileSync(join(pkg2Dir, 'jsr.json'), 'utf8')
      );
      expect(updatedJsrJson.imports.pkg1).toBe('jsr:@prefer-jsr/pkg1@^3.0.0');
    });

    it('should not modify non-@prefer-jsr imports', () => {
      // Setup
      const pkgDir = join(packagesDir, 'test-pkg');
      mkdirSync(pkgDir, { recursive: true });

      writeFileSync(
        join(pkgDir, 'package.json'),
        JSON.stringify(
          { name: '@prefer-jsr/test-pkg', version: '1.0.0' },
          null,
          2
        )
      );
      writeFileSync(
        join(pkgDir, 'jsr.json'),
        JSON.stringify(
          {
            name: '@prefer-jsr/test-pkg',
            version: '1.0.0',
            imports: {
              external: 'jsr:@external/package@^1.0.0',
              'npm-pkg': 'npm:some-package@^2.0.0',
            },
          },
          null,
          2
        )
      );

      // Execute
      const result = syncJsrJson({
        packagesDir,
      });

      // Verify
      expect(result.syncedCount).toBe(0);
      const jsrJson = JSON.parse(
        readFileSync(join(pkgDir, 'jsr.json'), 'utf8')
      );
      expect(jsrJson.imports.external).toBe('jsr:@external/package@^1.0.0');
      expect(jsrJson.imports['npm-pkg']).toBe('npm:some-package@^2.0.0');
    });

    it('should sync imports from any scope with local packages', () => {
      // Setup - Create packages with different scopes
      const pkg1Dir = join(packagesDir, 'pkg1');
      const pkg2Dir = join(packagesDir, 'pkg2');
      mkdirSync(pkg1Dir, { recursive: true });
      mkdirSync(pkg2Dir, { recursive: true });

      // pkg1 with @my-org scope
      writeFileSync(
        join(pkg1Dir, 'package.json'),
        JSON.stringify({ name: '@my-org/pkg1', version: '2.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkg1Dir, 'jsr.json'),
        JSON.stringify({ name: '@my-org/pkg1', version: '2.0.0' }, null, 2)
      );

      // pkg2 depends on pkg1 with outdated version
      writeFileSync(
        join(pkg2Dir, 'package.json'),
        JSON.stringify({ name: '@my-org/pkg2', version: '1.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkg2Dir, 'jsr.json'),
        JSON.stringify(
          {
            name: '@my-org/pkg2',
            version: '1.0.0',
            imports: {
              pkg1: 'jsr:@my-org/pkg1@^1.0.0',
            },
          },
          null,
          2
        )
      );

      // Execute
      const result = syncJsrJson({
        packagesDir,
      });

      // Verify
      expect(result.syncedCount).toBe(1);
      expect(result.syncedPackages[0].packageName).toBe('pkg2');
      expect(result.syncedPackages[0].changes).toContain(
        'imports[pkg1]: jsr:@my-org/pkg1@^1.0.0 → jsr:@my-org/pkg1@^2.0.0'
      );

      const updatedJsrJson = JSON.parse(
        readFileSync(join(pkg2Dir, 'jsr.json'), 'utf8')
      );
      expect(updatedJsrJson.imports.pkg1).toBe('jsr:@my-org/pkg1@^2.0.0');
    });
  });

  describe('multiple packages', () => {
    it('should sync multiple packages', () => {
      // Setup
      const pkg1Dir = join(packagesDir, 'pkg1');
      const pkg2Dir = join(packagesDir, 'pkg2');
      const pkg3Dir = join(packagesDir, 'pkg3');
      mkdirSync(pkg1Dir, { recursive: true });
      mkdirSync(pkg2Dir, { recursive: true });
      mkdirSync(pkg3Dir, { recursive: true });

      // pkg1 needs sync
      writeFileSync(
        join(pkg1Dir, 'package.json'),
        JSON.stringify({ version: '1.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkg1Dir, 'jsr.json'),
        JSON.stringify({ version: '0.9.0' }, null, 2)
      );

      // pkg2 already synced
      writeFileSync(
        join(pkg2Dir, 'package.json'),
        JSON.stringify({ version: '2.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkg2Dir, 'jsr.json'),
        JSON.stringify({ version: '2.0.0' }, null, 2)
      );

      // pkg3 needs sync
      writeFileSync(
        join(pkg3Dir, 'package.json'),
        JSON.stringify({ version: '3.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkg3Dir, 'jsr.json'),
        JSON.stringify({ version: '2.9.0' }, null, 2)
      );

      // Execute
      const result = syncJsrJson({
        packagesDir,
      });

      // Verify
      expect(result.syncedCount).toBe(2);
      expect(result.syncedPackages.map((p) => p.packageName).sort()).toEqual([
        'pkg1',
        'pkg3',
      ]);
    });
  });

  describe('error handling', () => {
    it('should skip packages without jsr.json', () => {
      // Setup
      const pkgDir = join(packagesDir, 'test-pkg');
      mkdirSync(pkgDir, { recursive: true });

      writeFileSync(
        join(pkgDir, 'package.json'),
        JSON.stringify({ version: '1.0.0' }, null, 2)
      );
      // No jsr.json

      // Execute
      const logs: string[] = [];
      const result = syncJsrJson({
        packagesDir,
        log: (msg) => logs.push(msg),
      });

      // Verify - should not error, just skip
      expect(result.syncedCount).toBe(0);
    });

    it('should skip packages without package.json', () => {
      // Setup
      const pkgDir = join(packagesDir, 'test-pkg');
      mkdirSync(pkgDir, { recursive: true });

      writeFileSync(
        join(pkgDir, 'jsr.json'),
        JSON.stringify({ version: '1.0.0' }, null, 2)
      );
      // No package.json

      // Execute
      const logs: string[] = [];
      const result = syncJsrJson({
        packagesDir,
        log: (msg) => logs.push(msg),
      });

      // Verify - should not error, just skip
      expect(result.syncedCount).toBe(0);
    });

    it('should handle missing dependency gracefully', () => {
      // Setup
      const pkgDir = join(packagesDir, 'test-pkg');
      mkdirSync(pkgDir, { recursive: true });

      writeFileSync(
        join(pkgDir, 'package.json'),
        JSON.stringify({ version: '1.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkgDir, 'jsr.json'),
        JSON.stringify(
          {
            version: '1.0.0',
            imports: {
              missing: 'jsr:@prefer-jsr/missing@^1.0.0',
            },
          },
          null,
          2
        )
      );

      // Execute
      const logs: string[] = [];
      syncJsrJson({
        packagesDir,
        log: (msg) => logs.push(msg),
      });

      // Verify - should not error, just skip the missing dependency
      expect(logs.some((log) => log.includes('already in sync'))).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty packages directory', () => {
      // Execute
      const logs: string[] = [];
      const result = syncJsrJson({
        packagesDir,
        log: (msg) => logs.push(msg),
      });

      // Verify
      expect(result.syncedCount).toBe(0);
      expect(result.syncedPackages).toHaveLength(0);
    });

    it('should handle packages with no imports field', () => {
      // Setup
      const pkgDir = join(packagesDir, 'test-pkg');
      mkdirSync(pkgDir, { recursive: true });

      writeFileSync(
        join(pkgDir, 'package.json'),
        JSON.stringify({ version: '1.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkgDir, 'jsr.json'),
        JSON.stringify({ version: '0.9.0' }, null, 2)
      );

      // Execute
      const result = syncJsrJson({
        packagesDir,
      });

      // Verify
      expect(result.syncedCount).toBe(1);
      expect(result.syncedPackages[0].changes).toHaveLength(1);
    });

    it('should handle packages with empty imports object', () => {
      // Setup
      const pkgDir = join(packagesDir, 'test-pkg');
      mkdirSync(pkgDir, { recursive: true });

      writeFileSync(
        join(pkgDir, 'package.json'),
        JSON.stringify({ version: '1.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkgDir, 'jsr.json'),
        JSON.stringify({ version: '0.9.0', imports: {} }, null, 2)
      );

      // Execute
      const result = syncJsrJson({
        packagesDir,
      });

      // Verify
      expect(result.syncedCount).toBe(1);
      expect(result.syncedPackages[0].changes).toHaveLength(1);
    });
  });

  describe('combined updates', () => {
    it('should sync both version and imports in one go', () => {
      // Setup
      const pkg1Dir = join(packagesDir, 'pkg1');
      const pkg2Dir = join(packagesDir, 'pkg2');
      mkdirSync(pkg1Dir, { recursive: true });
      mkdirSync(pkg2Dir, { recursive: true });

      writeFileSync(
        join(pkg1Dir, 'package.json'),
        JSON.stringify({ name: '@prefer-jsr/pkg1', version: '3.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkg1Dir, 'jsr.json'),
        JSON.stringify({ name: '@prefer-jsr/pkg1', version: '3.0.0' }, null, 2)
      );

      writeFileSync(
        join(pkg2Dir, 'package.json'),
        JSON.stringify({ name: '@prefer-jsr/pkg2', version: '2.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkg2Dir, 'jsr.json'),
        JSON.stringify(
          {
            name: '@prefer-jsr/pkg2',
            version: '1.0.0',
            imports: {
              pkg1: 'jsr:@prefer-jsr/pkg1@^2.0.0',
            },
          },
          null,
          2
        )
      );

      // Execute
      const result = syncJsrJson({
        packagesDir,
      });

      // Verify
      expect(result.syncedCount).toBe(1);
      expect(result.syncedPackages[0].packageName).toBe('pkg2');
      expect(result.syncedPackages[0].changes).toHaveLength(2);
      expect(result.syncedPackages[0].changes).toContain(
        'version: 1.0.0 → 2.0.0'
      );
      expect(result.syncedPackages[0].changes).toContain(
        'imports[pkg1]: jsr:@prefer-jsr/pkg1@^2.0.0 → jsr:@prefer-jsr/pkg1@^3.0.0'
      );

      const updatedJsrJson = JSON.parse(
        readFileSync(join(pkg2Dir, 'jsr.json'), 'utf8')
      );
      expect(updatedJsrJson.version).toBe('2.0.0');
      expect(updatedJsrJson.imports.pkg1).toBe('jsr:@prefer-jsr/pkg1@^3.0.0');
    });
  });

  describe('version constraint handling', () => {
    it('should preserve tilde (~) version prefix', () => {
      // Setup
      const pkg1Dir = join(packagesDir, 'pkg1');
      const pkg2Dir = join(packagesDir, 'pkg2');
      mkdirSync(pkg1Dir, { recursive: true });
      mkdirSync(pkg2Dir, { recursive: true });

      writeFileSync(
        join(pkg1Dir, 'package.json'),
        JSON.stringify({ name: '@my-org/pkg1', version: '2.5.0' }, null, 2)
      );
      writeFileSync(
        join(pkg1Dir, 'jsr.json'),
        JSON.stringify({ name: '@my-org/pkg1', version: '2.5.0' }, null, 2)
      );

      writeFileSync(
        join(pkg2Dir, 'package.json'),
        JSON.stringify({ name: '@my-org/pkg2', version: '1.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkg2Dir, 'jsr.json'),
        JSON.stringify(
          {
            name: '@my-org/pkg2',
            version: '1.0.0',
            imports: {
              pkg1: 'jsr:@my-org/pkg1@~2.0.0',
            },
          },
          null,
          2
        )
      );

      // Execute
      syncJsrJson({ packagesDir });

      // Verify - should preserve tilde prefix
      const updatedJsrJson = JSON.parse(
        readFileSync(join(pkg2Dir, 'jsr.json'), 'utf8')
      );
      expect(updatedJsrJson.imports.pkg1).toBe('jsr:@my-org/pkg1@~2.5.0');
    });

    it('should handle exact version (no prefix)', () => {
      // Setup
      const pkg1Dir = join(packagesDir, 'pkg1');
      const pkg2Dir = join(packagesDir, 'pkg2');
      mkdirSync(pkg1Dir, { recursive: true });
      mkdirSync(pkg2Dir, { recursive: true });

      writeFileSync(
        join(pkg1Dir, 'package.json'),
        JSON.stringify({ name: '@my-org/pkg1', version: '3.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkg1Dir, 'jsr.json'),
        JSON.stringify({ name: '@my-org/pkg1', version: '3.0.0' }, null, 2)
      );

      writeFileSync(
        join(pkg2Dir, 'package.json'),
        JSON.stringify({ name: '@my-org/pkg2', version: '1.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkg2Dir, 'jsr.json'),
        JSON.stringify(
          {
            name: '@my-org/pkg2',
            version: '1.0.0',
            imports: {
              pkg1: 'jsr:@my-org/pkg1@2.0.0',
            },
          },
          null,
          2
        )
      );

      // Execute
      syncJsrJson({ packagesDir });

      // Verify - should add default caret prefix
      const updatedJsrJson = JSON.parse(
        readFileSync(join(pkg2Dir, 'jsr.json'), 'utf8')
      );
      expect(updatedJsrJson.imports.pkg1).toBe('jsr:@my-org/pkg1@^3.0.0');
    });

    it('should preserve caret (^) version prefix', () => {
      // Setup
      const pkg1Dir = join(packagesDir, 'pkg1');
      const pkg2Dir = join(packagesDir, 'pkg2');
      mkdirSync(pkg1Dir, { recursive: true });
      mkdirSync(pkg2Dir, { recursive: true });

      writeFileSync(
        join(pkg1Dir, 'package.json'),
        JSON.stringify({ name: '@my-org/pkg1', version: '4.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkg1Dir, 'jsr.json'),
        JSON.stringify({ name: '@my-org/pkg1', version: '4.0.0' }, null, 2)
      );

      writeFileSync(
        join(pkg2Dir, 'package.json'),
        JSON.stringify({ name: '@my-org/pkg2', version: '1.0.0' }, null, 2)
      );
      writeFileSync(
        join(pkg2Dir, 'jsr.json'),
        JSON.stringify(
          {
            name: '@my-org/pkg2',
            version: '1.0.0',
            imports: {
              pkg1: 'jsr:@my-org/pkg1@^3.0.0',
            },
          },
          null,
          2
        )
      );

      // Execute
      syncJsrJson({ packagesDir });

      // Verify - should preserve caret prefix
      const updatedJsrJson = JSON.parse(
        readFileSync(join(pkg2Dir, 'jsr.json'), 'utf8')
      );
      expect(updatedJsrJson.imports.pkg1).toBe('jsr:@my-org/pkg1@^4.0.0');
    });
  });
});
