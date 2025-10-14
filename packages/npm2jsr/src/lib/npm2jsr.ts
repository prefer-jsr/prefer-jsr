/**
 * Metadata for NPM to JSR package mappings
 */
export interface JsrPackageInfo {
  /** The JSR package name */
  jsrPackage: string;
  /** Minimum version that has a JSR equivalent (e.g., "3.0.0") */
  minimumVersion: string;
  /** URL to the source code repository for reference. */
  sourceUrl?: string;
}

/**
 * Mapping of NPM package names to their JSR equivalents with metadata
 * Key: NPM package name
 * Value: JSR package information including version constraints
 *
 * @example
 * // To add a new mapping:
 * ['npm-package-name', {
 *   jsrPackage: '@scope/jsr-package-name',
 *   minimumVersion: '1.0.0',
 *   sourceUrl: 'https://github.com/author/repo',
 * }]
 */
export const npmToJsrMapping: Map<string, JsrPackageInfo> = new Map<
  string,
  JsrPackageInfo
>([
  [
    '@eslint/compat',
    {
      jsrPackage: '@eslint/compat',
      minimumVersion: '1.0.3',
      sourceUrl: 'https://github.com/eslint/rewrite',
    },
  ],
  [
    '@eslint/config-array',
    {
      jsrPackage: '@eslint/config-array',
      minimumVersion: '0.15.1',
      sourceUrl: 'https://github.com/eslint/rewrite',
    },
  ],
  [
    '@eslint/config-helpers',
    {
      jsrPackage: '@eslint/config-helpers',
      minimumVersion: '0.1.0',
      sourceUrl: 'https://github.com/eslint/rewrite',
    },
  ],
  [
    '@eslint/core',
    {
      jsrPackage: '@eslint/core',
      minimumVersion: '0.1.0',
      sourceUrl: 'https://github.com/eslint/rewrite',
    },
  ],
  [
    '@eslint/css',
    {
      jsrPackage: '@eslint/css',
      minimumVersion: '0.2.0',
      sourceUrl: 'https://github.com/eslint/css',
    },
  ],
  [
    '@eslint/json',
    {
      jsrPackage: '@eslint/json',
      minimumVersion: '0.2.0',
      sourceUrl: 'https://github.com/eslint/json',
    },
  ],
  [
    '@eslint/markdown',
    {
      jsrPackage: '@eslint/markdown',
      minimumVersion: '6.0.0',
      sourceUrl: 'https://github.com/eslint/markdown',
    },
  ],
  [
    '@eslint/object-schema',
    {
      jsrPackage: '@eslint/object-schema',
      minimumVersion: '2.1.3',
      sourceUrl: 'https://github.com/eslint/rewrite',
    },
  ],
  [
    '@eslint/plugin-kit',
    {
      jsrPackage: '@eslint/plugin-kit',
      minimumVersion: '0.2.1',
      sourceUrl: 'https://github.com/eslint/rewrite',
    },
  ],
  [
    'zod',
    {
      jsrPackage: '@zod/zod',
      minimumVersion: '3.0.0',
      sourceUrl: 'https://github.com/colinhacks/zod',
    },
  ],
]);

/**
 * Get all available NPM packages that have JSR equivalents
 * @returns Array of NPM package names that have JSR mappings
 */
export function getAvailableNpmPackages(): string[] {
  return Array.from(npmToJsrMapping.keys());
}

/**
 * Get the JSR package name for an NPM package
 * @param npmPackage The NPM package name
 * @returns The JSR package name (without jsr: prefix) or null if no mapping exists
 */
export function getJsrEquivalent(npmPackage: string): null | string {
  const info = npmToJsrMapping.get(npmPackage);
  return info ? info.jsrPackage : null;
}

/**
 * Get full package information for an NPM package
 * @param npmPackage The NPM package name
 * @returns The JSR package information or null if no mapping exists
 */
export function getJsrPackageInfo(npmPackage: string): JsrPackageInfo | null {
  return npmToJsrMapping.get(npmPackage) || null;
}

/**
 * Check if an NPM package has a JSR equivalent
 * @param npmPackage The NPM package name
 * @returns True if a JSR equivalent exists
 */
export function hasJsrEquivalent(npmPackage: string): boolean {
  return npmToJsrMapping.has(npmPackage);
}

/**
 * Convert a version range to JSR format
 * @param version The NPM version range (e.g., "^4.1.12")
 * @returns The complete JSR dependency string (e.g., "jsr:^4.1.12")
 */
export function toJsrDependency(version: string): string {
  return `jsr:${version}`;
}
