# @prefer-jsr/eslint-plugin-prefer-jsr

An ESLint plugin that suggests using JSR packages over NPM when available.

## Installation

```bash
npm install --save-dev @prefer-jsr/eslint-plugin-prefer-jsr
```

For the new ESLint JSON parser (recommended):
```bash
npm install --save-dev @eslint/json
```

For the legacy JSON parser:
```bash
npm install --save-dev jsonc-eslint-parser
```

## Usage

This plugin works with `package.json` files and supports both the new `@eslint/json` parser and the legacy `jsonc-eslint-parser`.

### Flat Config (ESLint 9+) with @eslint/json (recommended)

```js
// eslint.config.js
import preferJsr from '@prefer-jsr/eslint-plugin-prefer-jsr';
import json from '@eslint/json';

export default [
  {
    files: ['package.json'],
    language: 'json/json',
    plugins: {
      '@prefer-jsr': preferJsr,
      json,
    },
    rules: {
      '@prefer-jsr/prefer-jsr': 'warn',
    },
  },
];
```

### Flat Config (ESLint 9+) with jsonc-eslint-parser (legacy)

```js
// eslint.config.js
import preferJsr from '@prefer-jsr/eslint-plugin-prefer-jsr';
import jsoncParser from 'jsonc-eslint-parser';

export default [
  {
    files: ['package.json'],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      '@prefer-jsr': preferJsr,
    },
    rules: {
      '@prefer-jsr/prefer-jsr': 'warn',
    },
  },
];
```

## Rules

### `prefer-jsr`

This rule warns when a dependency in `package.json` has a JSR equivalent available.

**Current mappings:**

- `zod` → `@zod/zod`
- `@eslint/markdown` → `@eslint/markdown`

#### Configuration

The rule accepts an options object with the following properties:

- `customMappings` (object): Additional NPM to JSR package mappings
- `ignore` (array): List of package names to ignore
- `severity` (string): Override severity level ('error', 'warn', 'off')

#### Examples

**Basic usage:**

```js
{
  rules: {
    '@prefer-jsr/prefer-jsr': 'warn',
  },
}
```

**With custom mappings:**

```js
{
  rules: {
    '@prefer-jsr/prefer-jsr': ['warn', {
      customMappings: {
        'my-package': '@my/jsr-package',
        'another-npm-pkg': '@company/another-pkg'
      }
    }],
  },
}
```

**Ignoring specific packages:**

```js
{
  rules: {
    '@prefer-jsr/prefer-jsr': ['warn', {
      ignore: ['legacy-package', 'special-case']
    }],
  },
}
```

**Custom severity:**

```js
{
  rules: {
    '@prefer-jsr/prefer-jsr': ['warn', {
      severity: 'error'
    }],
  },
}
```

#### Valid

```json
{
  "dependencies": {
    "@zod/zod": "jsr:^4.1.12"
  }
}
```

#### Invalid

```json
{
  "dependencies": {
    "zod": "^4.1.12"
  }
}
```

**Auto-fix available**: The rule can automatically replace NPM dependencies with their JSR equivalents.

## Features

- 🔍 **Detection**: Identifies NPM dependencies that have JSR equivalents
- 🔧 **Auto-fix**: Automatically replaces NPM imports with JSR versions
- 📦 **Package.json support**: Works with all dependency types (`dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`)
- 🎯 **Modern**: Uses `@eslint/json` for proper JSON language support

## Dependencies

This plugin specifically supports JSR packages that have been identified as having NPM equivalents. The mapping is maintained in the plugin and can be extended over time.

## Contributing

### Building

Run `nx build eslint-plugin` to build the library.

### Running unit tests

Run `nx test eslint-plugin` to execute the unit tests via [Vitest](https://vitest.dev/).
