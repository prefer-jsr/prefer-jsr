import type { ESLint } from 'eslint';

import { preferJsrRule } from './rules/prefer-jsr.js';

/**
 * ESLint plugin that suggests using JSR packages over npm when available.
 *
 * This plugin provides the `prefer-jsr` rule that checks your dependencies
 * and suggests JSR alternatives when they exist.
 *
 * @example
 * ```js
 * // eslint.config.js
 * import preferJsr from '@prefer-jsr/eslint-plugin-prefer-jsr';
 *
 * export default [
 *   {
 *     plugins: {
 *       'prefer-jsr': preferJsr,
 *     },
 *     rules: {
 *       'prefer-jsr/prefer-jsr': 'error',
 *     },
 *   },
 * ];
 * ```
 */
const plugin: ESLint.Plugin = {
  configs: {
    recommended: {
      files: ['**/package.json'],
      name: 'prefer-jsr/recommended',
      rules: {
        '@prefer-jsr/prefer-jsr': 'error',
      },
    },
  },
  meta: {
    name: '@prefer-jsr/eslint-plugin-prefer-jsr',
    version: '0.0.1',
  },
  rules: {
    'prefer-jsr': preferJsrRule,
  },
};

export default plugin;
