import type { ESLint } from 'eslint';

import { recommendedConfig } from './configs/recommended.js';
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
 * import { defineConfig } from 'eslint/config';
 * import preferJsr from '@prefer-jsr/eslint-plugin-prefer-jsr';
 * import json from '@eslint/json';
 *
 * export default defineConfig([
 *   {
 *     files: ['package.json'],
 *     language: 'json/json',
 *     plugins: {
 *       preferJsr,
 *       json,
 *     },
 *     extends: ['prefer-jsr/recommended'],
 *   }
 * ]);
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
