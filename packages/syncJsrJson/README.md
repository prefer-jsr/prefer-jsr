# @prefer-jsr/syncJsrJson

Sync jsr.json versions with package.json versions in monorepos.

## Overview

This package provides a utility function to automatically synchronize version numbers between `package.json` and `jsr.json` files in a package. It's particularly useful in release workflows to ensure that JSR package import versions stay in sync with npm package dependency versions.

## Features

- ✅ Syncs main package version from `package.json` to `jsr.json`
- ✅ Syncs JSR dependency import versions in `jsr.json` to match local package versions
- ✅ Supports dry-run mode for testing
- ✅ Provides detailed sync results
- ✅ Handles missing files gracefully

## Installation

```bash
npm install @prefer-jsr/syncJsrJson
# or
pnpm add @prefer-jsr/syncJsrJson
# or
yarn add @prefer-jsr/syncJsrJson
```

## Usage

### Basic Usage

```typescript
import { syncJsrJson } from '@prefer-jsr/syncJsrJson';

// Sync all packages in the default packages directory
const result = syncJsrJson();

console.log(`Synced ${result.syncedCount} packages`);
```

### With Options

```typescript
import { syncJsrJson } from '@prefer-jsr/syncJsrJson';

const result = syncJsrJson({
  packagesDir: './my-packages',  // Custom packages directory
  dryRun: true,                  // Test without writing changes
  log: (msg) => console.log(msg) // Custom logger
});

// Check what would be synced
result.syncedPackages.forEach(pkg => {
  console.log(`Package: ${pkg.packageName}`);
  pkg.changes.forEach(change => {
    console.log(`  - ${change}`);
  });
});
```

### In Release Scripts

```typescript
import { syncJsrJson } from '@prefer-jsr/syncJsrJson';

// Before creating a release
const result = syncJsrJson({ dryRun: false });

if (result.syncedCount > 0) {
  console.log('JSR versions synced successfully!');
  // Continue with release process...
}
```

## API

### `syncJsrJson(options?: SyncJsrJsonOptions): SyncResult`

Syncs jsr.json versions to match package.json versions.

#### Options

```typescript
interface SyncJsrJsonOptions {
  /**
   * The directory containing the packages to sync
   * @default process.cwd() + '/packages'
   */
  packagesDir?: string;
  
  /**
   * Whether to run in dry-run mode (don't write files)
   * @default false
   */
  dryRun?: boolean;
  
  /**
   * Custom logger function for output
   * @default console.log
   */
  log?: (message: string) => void;
}
```

#### Returns

```typescript
interface SyncResult {
  /**
   * Number of packages that were synced
   */
  syncedCount: number;
  
  /**
   * Details of packages that were synced
   */
  syncedPackages: Array<{
    packageName: string;
    changes: string[];
  }>;
}
```

## How It Works

The function:

1. Scans all directories in the `packagesDir`
2. For each directory with both `package.json` and `jsr.json`:
   - Syncs the main version field
   - Syncs any `jsr:` imports to use the latest local package versions (if the package exists locally)
3. Returns a summary of all changes made

## Example Sync

Given:

```json
// packages/my-pkg/package.json
{
  "name": "@my-org/my-pkg",
  "version": "2.0.0"
}

// packages/my-pkg/jsr.json
{
  "name": "@my-org/my-pkg",
  "version": "1.0.0",
  "imports": {
    "dep": "jsr:@my-org/dep@^1.0.0"
  }
}

// packages/dep/package.json
{
  "name": "@my-org/dep",
  "version": "2.0.0"
}
```

After running `syncJsrJson()`:

```json
// packages/my-pkg/jsr.json
{
  "name": "@my-org/my-pkg",
  "version": "2.0.0",  // ✅ Updated
  "imports": {
    "dep": "jsr:@my-org/dep@^2.0.0"  // ✅ Updated
  }
}
```

## License

MIT

## Building

Run `nx build syncJsrJson` to build the library.

## Running unit tests

Run `nx test syncJsrJson` to execute the unit tests via [Vitest](https://vitest.dev/).
