import type { ESLint } from 'eslint';

import { recommendedConfig } from './configs/recommended.js';
import { preferJsrRule } from './rules/prefer-jsr.js';

/**
 * An ESLint plugin that suggests using JSR packages over NPM when available.
 *
 * This plugin works with `package.json` files and supports both the new `@eslint/json`
 * parser and the legacy `jsonc-eslint-parser`.
 *
 * **Features:**
 * - 🔍 **Detection** - Identifies NPM dependencies that have JSR equivalents
 * - 🔧 **Auto-fix** - Automatically replaces NPM imports with JSR versions
 * - 📦 **Package.json support** - Works with all dependency types (`dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`)
 *
 * **Rules:**
 * - `prefer-jsr` - Warns when a dependency has a JSR equivalent available
 *
 * **Configs:**
 * - `recommended` - Applies to `package.json` files with `error` severity
 *
 * @example Recommended Config
 * ```js
 * // eslint.config.js
 * import { defineConfig } from 'eslint/config';
 * import preferJsr from '@prefer-jsr/eslint-plugin-prefer-jsr';
 * import json from '@eslint/json';
 *
 * export default defineConfig([
 *   {
 *     plugins: {
 *       preferJsr,
 *       json,
 *     },
 *     extends: ['prefer-jsr/recommended'],
 *   },
 * ]);
 * ```
 *
 * @example Flat Config (ESLint 9+) with @eslint/json
 * ```js
 * // eslint.config.js
 * import preferJsr from '@prefer-jsr/eslint-plugin-prefer-jsr';
 * import json from '@eslint/json';
 *
 * export default [
 *   {
 *     files: ['package.json'],
 *     language: 'json/json',
 *     plugins: {
 *       '@prefer-jsr': preferJsr,
 *       json,
 *     },
 *     rules: {
 *       '@prefer-jsr/prefer-jsr': 'error',
 *     },
 *   },
 * ];
 * ```
 *
 * @example Ignoring specific packages
 * ```js
 * {
 *   rules: {
 *     '@prefer-jsr/prefer-jsr': ['error', {
 *       ignore: ['legacy-package', 'special-case']
 *     }],
 *   },
 * }
 * ```
 */
const plugin: ESLint.Plugin = {
  meta: {
    name: '@prefer-jsr/eslint-plugin-prefer-jsr',
    version: '0.0.1',
  },
  rules: {
    'prefer-jsr': preferJsrRule,
  },
};
const configs = {
  recommended: recommendedConfig(),
};

plugin.configs = configs;

export default plugin;
