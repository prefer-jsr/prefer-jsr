/**
 * Compare two semantic version strings
 * @param v1 First version (e.g., "3.21.4")
 * @param v2 Second version (e.g., "3.0.0")
 * @returns -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}

/**
 * Extract the base version number from a semver range string
 * Handles: ^, ~, >=, >, =, and exact versions
 * @param versionRange The version range (e.g., "^3.21.4", "~2.0.0", ">=1.0.0")
 * @returns The extracted version number (e.g., "3.21.4") or null if invalid
 */
export function extractVersion(versionRange: string): null | string {
  // Match semver operators followed by version number
  const match = versionRange.match(/[\^~>=]*\s*([\d.]+)/);
  return match ? match[1] : null;
}

/**
 * Check if a version meets the minimum version requirement
 * @param versionRange The version range from package.json (e.g., "^3.21.4")
 * @param minimumVersion The minimum required version (e.g., "3.0.0")
 * @returns True if the version is >= minimumVersion
 */
export function meetsMinimumVersion(
  versionRange: string,
  minimumVersion: string
): boolean {
  const version = extractVersion(versionRange);
  if (!version) {
    return false;
  }

  return compareVersions(version, minimumVersion) >= 0;
}
