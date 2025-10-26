![npm1jsr](./assets/npm2jsr.svg)

# @prefer-jsr/npm2jsr

A utility package that provides mapping between NPM packages and their JSR equivalents.

## Installation

```bash
npm install @prefer-jsr/npm2jsr
```

## Usage

```typescript
import {
  getJsrEquivalent,
  hasJsrEquivalent,
  toJsrDependency,
} from '@prefer-jsr/npm2jsr';

// Check if a package has a JSR equivalent
if (hasJsrEquivalent('zod')) {
  const jsrPackage = getJsrEquivalent('zod'); // '@zod/zod'
  const jsrDep = toJsrDependency('^3.21.4'); // 'jsr:^3.21.4'
}

// Get all available mappings
import { getAvailableNpmPackages } from '@prefer-jsr/npm2jsr';
const packages = getAvailableNpmPackages(); // ['zod', '@eslint/markdown']
```

## API

### `getJsrEquivalent(npmPackage: string): string | null`

Returns the JSR package name for a given NPM package, or null if no mapping exists.

### `hasJsrEquivalent(npmPackage: string): boolean`

Checks if an NPM package has a JSR equivalent.

### `toJsrDependency(version: string): string`

Converts a version string to JSR format by prefixing with `jsr:`.

### `getAvailableNpmPackages(): string[]`

Returns an array of all NPM packages that have JSR mappings.

## Contributing

This package is part of the prefer-jsr monorepo. The mapping may be updated as new packages become available on JSR.

## Building

Run `nx build npm2jsr` to build the library.

## Running unit tests

Run `nx test npm2jsr` to execute the unit tests via [Vitest](https://vitest.dev/).
