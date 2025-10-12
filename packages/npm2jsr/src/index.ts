/**
 * @module
 *
 * Mapping library that provides data about npm packages and their JSR equivalents.
 *
 * This module helps you discover JSR alternatives to popular npm packages and
 * manage dependencies in projects that prefer JSR packages.
 *
 * @example
 * ```ts
 * import { getJsrEquivalent, hasJsrEquivalent } from '@prefer-jsr/npm2jsr';
 *
 * // Check if a package has a JSR equivalent
 * if (hasJsrEquivalent('@eslint/markdown')) {
 *   const jsrPackage = getJsrEquivalent('@eslint/markdown');
 *   console.log(jsrPackage); // '@eslint/markdown'
 * }
 *
 * // Get all available mappings
 * import { npmToJsrMapping } from '@prefer-jsr/npm2jsr';
 * for (const [npm, jsr] of npmToJsrMapping) {
 *   console.log(`${npm} -> ${jsr.jsrPackage}`);
 * }
 * ```
 */

export {
  npmToJsrMapping,
  getJsrEquivalent,
  getJsrPackageInfo,
  toJsrDependency,
  getAvailableNpmPackages,
  hasJsrEquivalent,
  type JsrPackageInfo,
} from './lib/npm2jsr.js';
