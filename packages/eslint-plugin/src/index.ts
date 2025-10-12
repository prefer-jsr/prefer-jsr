/**
 * @module
 *
 * ESLint plugin that suggests using JSR packages over npm when available.
 *
 * This plugin analyzes your `package.json` dependencies and suggests JSR alternatives
 * for packages that are available on JSR.
 *
 * @example
 * ```js
 * // eslint.config.js
 * import preferJsr from '@prefer-jsr/eslint-plugin-prefer-jsr';
 *
 * export default [
 *   {
 *     files: ['package.json'],
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

export { default } from './lib/eslint-plugin.js';
