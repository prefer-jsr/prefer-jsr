# @prefer-jsr/eslint-plugin-prefer-jsr

An ESLint plugin that suggests using JSR packages over NPM when available.

## Installation

```bash
pnpm i jsr:@prefer-jsr/eslint-plugin-prefer-jsr
```

```bash
yarn add jsr:@prefer-jsr/eslint-plugin-prefer-jsr
```

```bash
npx jsr add @prefer-jsr/eslint-plugin-prefer-jsr
```

<details>
<summary>NPM Cli (If you really need it for some reason)</summary>

```bash
npm install --save-dev @prefer-jsr/eslint-plugin-prefer-jsr
```

</details>

For the new ESLint JSON parser (recommended):

```bash
pnpm i @eslint/json
```

```bash
yarn add @eslint/json
```

```bash
npx jsr add @eslint/json
```

<details>
<summary>NPM Cli (If you really need it for some reason)</summary>

```bash
npm install --save-dev @eslint/json
```

</details>

For the legacy JSON parser:

```bash
pnpm i jsonc-eslint-parser
```

```bash
yarn add jsonc-eslint-parser
```

```bash
npx jsr add jsonc-eslint-parser
```

<details>
<summary>NPM Cli (If you really need it for some reason)</summary>

```bash
npm install --save-dev jsonc-eslint-parser
```

</details>

## Usage

This plugin works with `package.json` files and supports both the new `@eslint/json` parser and the legacy `jsonc-eslint-parser`.

### Recommended Config

One way to use this plugin is with the recommended config:

```js
// eslint.config.js
import { defineConfig } from 'eslint/config';
import preferJsr from '@prefer-jsr/eslint-plugin-prefer-jsr';
import json from '@eslint/json';

export default defineConfig([
  {
    plugins: {
      preferJsr,
      json,
    },
    extends: ['prefer-jsr/recommended'],
  },
]);
```

The recommended config automatically:

- Applies to `**/package.json` files
- Enables the `@prefer-jsr/prefer-jsr` rule with `error` severity

### Flat Config (ESLint 9+) with @eslint/json

For more control, you can configure the plugin manually:

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
      '@prefer-jsr/prefer-jsr': 'error',
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
      '@prefer-jsr/prefer-jsr': 'error',
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

- `ignore` (array): List of package names to ignore

#### Examples

**Basic usage:**

```js
{
  rules: {
    '@prefer-jsr/prefer-jsr': 'error',
  },
}
```

**Ignoring specific packages:**

```js
{
  rules: {
    '@prefer-jsr/prefer-jsr': ['error', {
      ignore: ['legacy-package', 'special-case']
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
