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
  // ESLint packages
  [
    '@eslint/markdown',
    {
      jsrPackage: '@eslint/markdown',
      minimumVersion: '6.0.0',
      sourceUrl: 'https://github.com/eslint/markdown',
    },
  ],

  // Validation libraries
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
 * Get the JSR package name for an NPM package
 * @param npmPackage The NPM package name
 * @returns The JSR package name (without jsr: prefix) or null if no mapping exists
 */
export function getJsrEquivalent(npmPackage: string): string | null {
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
 * Convert a version range to JSR format
 * @param version The NPM version range (e.g., "^4.1.12")
 * @returns The complete JSR dependency string (e.g., "jsr:^4.1.12")
 */
export function toJsrDependency(version: string): string {
  return `jsr:${version}`;
}

/**
 * Get all available NPM packages that have JSR equivalents
 * @returns Array of NPM package names that have JSR mappings
 */
export function getAvailableNpmPackages(): string[] {
  return Array.from(npmToJsrMapping.keys());
}

/**
 * Check if an NPM package has a JSR equivalent
 * @param npmPackage The NPM package name
 * @returns True if a JSR equivalent exists
 */
export function hasJsrEquivalent(npmPackage: string): boolean {
  return npmToJsrMapping.has(npmPackage);
}
