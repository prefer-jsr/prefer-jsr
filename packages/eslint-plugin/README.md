# @prefer-jsr/eslint-plugin-prefer-jsr &middot; [![JSR](https://jsr.io/badges/@prefer-jsr/eslint-plugin-prefer-jsr)](https://jsr.io/@prefer-jsr/eslint-plugin-prefer-jsr)

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
<summary>NPM registry (If you really need it for some reason)</summary>

```bash
npm install --save-dev @prefer-jsr/eslint-plugin-prefer-jsr
```

</details>

### With new ESLint JSON language feature (recommended)

```bash
pnpm i jsr:@eslint/json
```

```bash
yarn add jsr:@eslint/json
```

```bash
npx jsr add @eslint/json
```

<details>
<summary>NPM registry (If you really need it for some reason)</summary>

```bash
npm install --save-dev @eslint/json
```

</details>

### With the legacy JSON parser

```bash
pnpm add -D jsonc-eslint-parser
```

```bash
yarn add -D jsonc-eslint-parser
```

```bash
npm install --save-dev jsonc-eslint-parser
```

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

**example mappings:**

- `zod` → `@zod/zod`
- `@eslint/markdown` → `@eslint/markdown`

#### Configuration

The rule accepts an options object with the following properties:

| Option | Type | Description |
|--------|------|-------------|
| `exclude` | `string[]` | Package names to **always** skip, regardless of any other setting (overrides `strict` and `include`). |
| `include` | `string[]` | Package names to **force-include** in the check, even if they would normally be skipped (e.g. they have a bin entry or are below the minimum version). Overridden only by `exclude`. |
| `strict` | `boolean` | When `true`, report packages that have a bin entry (`hasBin: true`) as well. By default those packages are skipped to avoid breaking CLI tools. |
| `ignore` | `string[]` | *(Deprecated — use `exclude` instead.)* Package names to skip. |

**Option priority** (highest wins):

1. `exclude` — absolute skip; overrides everything
2. `include` — force-include; overrides `hasBin` skip and minimum-version gate
3. `strict` — globally enables reporting for `hasBin` packages
4. Default — skip `hasBin` packages silently

**`hasBin` behaviour**

Packages whose mapping entry has `hasBin: true` (e.g. CLI tools like `typescript`) are skipped by default because their JSR equivalent may not provide the same binary. Use `strict: true` to report them anyway, or add individual packages to `include` to force-include them.

**Version clamping for `include`**

When a package listed in `include` is in the mapping and the installed version is below the mapping's `minimumVersion`, the auto-fix clamps the suggested version up to `minimumVersion` while preserving the range operator (e.g. `^`). For packages not in the mapping, the fix keeps the original version and just prepends `jsr:`.

#### Examples

**Basic usage:**

```js
{
  rules: {
    '@prefer-jsr/prefer-jsr': 'error',
  },
}
```

**Excluding specific packages:**

```js
{
  rules: {
    '@prefer-jsr/prefer-jsr': ['error', {
      exclude: ['some-cli-tool', 'another-package'],
    }],
  },
}
```

**Strict mode — report CLI/bin packages too:**

```js
{
  rules: {
    '@prefer-jsr/prefer-jsr': ['error', {
      strict: true,
    }],
  },
}
```

**Force-including a specific package (overrides `hasBin` skip):**

```js
{
  rules: {
    '@prefer-jsr/prefer-jsr': ['error', {
      include: ['typescript'],
    }],
  },
}
```

**Combined — strict mode with a safety exclusion:**

```js
{
  rules: {
    '@prefer-jsr/prefer-jsr': ['error', {
      strict: true,
      exclude: ['some-package-i-must-keep-on-npm'],
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
