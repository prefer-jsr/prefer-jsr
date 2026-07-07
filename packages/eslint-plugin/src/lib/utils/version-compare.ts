interface ParsedVersionRange {
  operator: string;
  version: string;
}

/**
 * Clamp a version range to a minimum version, preserving the range operator.
 * If the range already meets the minimum, it is returned unchanged.
 * @param versionRange The version range (e.g., "^2.0.0")
 * @param minimumVersion The minimum required version (e.g., "3.0.0")
 * @returns The clamped version range (e.g., "^3.0.0")
 */
export function clampVersionToMinimum(
  versionRange: string,
  minimumVersion: string,
): string {
  if (meetsMinimumVersion(versionRange, minimumVersion)) {
    return versionRange;
  }

  const parsedVersionRange = parseSimpleVersionRange(versionRange);
  if (!parsedVersionRange) {
    return minimumVersion;
  }

  // Upper-bound ranges still allow versions below the minimum, so clamp to a lower bound.
  if (['<', '<='].includes(parsedVersionRange.operator)) {
    return `>=${minimumVersion}`;
  }

  // Preserve operators that maintain the minimum as a lower bound (^, ~, >=, >, =, exact).
  const operator = parsedVersionRange.operator;
  return `${operator}${minimumVersion}`;
}

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
  const parsedVersionRange = parseSimpleVersionRange(versionRange);
  return parsedVersionRange?.version ?? null;
}

/**
 * Check if a version meets the minimum version requirement
 * @param versionRange The version range from package.json (e.g., "^3.21.4")
 * @param minimumVersion The minimum required version (e.g., "3.0.0")
 * @returns True if the version is >= minimumVersion
 */
export function meetsMinimumVersion(
  versionRange: string,
  minimumVersion: string,
): boolean {
  const parsedVersionRange = parseSimpleVersionRange(versionRange);
  if (!parsedVersionRange) {
    return false;
  }

  // Upper-bound ranges (e.g. <4.0.0) can still include unsupported versions below minimum.
  if (['<', '<='].includes(parsedVersionRange.operator)) {
    return false;
  }

  return compareVersions(parsedVersionRange.version, minimumVersion) >= 0;
}

function isValidSemverFormat(versionNumber: string): boolean {
  const versionParts = versionNumber.split('.');
  if (versionParts.length < 1 || versionParts.length > 3) {
    return false;
  }

  return versionParts.every((part) => /^\d+$/.test(part));
}

function parseSimpleVersionRange(
  versionRange: string,
): null | ParsedVersionRange {
  let normalizedRange = versionRange.trim();
  let operator = '';
  const knownOperators = ['>=', '<=', '>', '<', '^', '~', '='];

  for (const knownOperator of knownOperators) {
    if (normalizedRange.startsWith(knownOperator)) {
      operator = knownOperator;
      normalizedRange = normalizedRange.slice(knownOperator.length).trim();
      break;
    }
  }

  if (!isValidSemverFormat(normalizedRange)) {
    return null;
  }

  return {
    operator,
    version: normalizedRange,
  };
}
