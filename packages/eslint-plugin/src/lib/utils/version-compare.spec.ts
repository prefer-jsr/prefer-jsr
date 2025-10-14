import { describe, expect, it } from 'vitest';

import {
  compareVersions,
  extractVersion,
  meetsMinimumVersion,
} from './version-compare.js';

describe('version-compare', () => {
  describe('extractVersion', () => {
    it('should extract version from caret range', () => {
      expect(extractVersion('^3.21.4')).toBe('3.21.4');
      expect(extractVersion('^1.0.0')).toBe('1.0.0');
    });

    it('should extract version from tilde range', () => {
      expect(extractVersion('~2.3.4')).toBe('2.3.4');
      expect(extractVersion('~1.0.0')).toBe('1.0.0');
    });

    it('should extract version from comparison ranges', () => {
      expect(extractVersion('>=3.0.0')).toBe('3.0.0');
      expect(extractVersion('>2.0.0')).toBe('2.0.0');
      expect(extractVersion('=1.0.0')).toBe('1.0.0');
    });

    it('should extract exact version', () => {
      expect(extractVersion('3.21.4')).toBe('3.21.4');
      expect(extractVersion('1.0.0')).toBe('1.0.0');
    });

    it('should return null for invalid versions', () => {
      expect(extractVersion('invalid')).toBe(null);
      expect(extractVersion('latest')).toBe(null);
      expect(extractVersion('')).toBe(null);
    });
  });

  describe('compareVersions', () => {
    it('should return 0 for equal versions', () => {
      expect(compareVersions('3.0.0', '3.0.0')).toBe(0);
      expect(compareVersions('1.2.3', '1.2.3')).toBe(0);
    });

    it('should return 1 when v1 > v2', () => {
      expect(compareVersions('4.0.0', '3.0.0')).toBe(1);
      expect(compareVersions('3.1.0', '3.0.0')).toBe(1);
      expect(compareVersions('3.0.1', '3.0.0')).toBe(1);
      expect(compareVersions('3.21.4', '3.0.0')).toBe(1);
    });

    it('should return -1 when v1 < v2', () => {
      expect(compareVersions('2.0.0', '3.0.0')).toBe(-1);
      expect(compareVersions('3.0.0', '3.1.0')).toBe(-1);
      expect(compareVersions('3.0.0', '3.0.1')).toBe(-1);
      expect(compareVersions('2.99.99', '3.0.0')).toBe(-1);
    });

    it('should handle versions with different part counts', () => {
      expect(compareVersions('3.0', '3.0.0')).toBe(0);
      expect(compareVersions('3', '3.0.0')).toBe(0);
      expect(compareVersions('3.1', '3.0.0')).toBe(1);
    });
  });

  describe('meetsMinimumVersion', () => {
    it('should return true when version meets minimum', () => {
      expect(meetsMinimumVersion('^3.0.0', '3.0.0')).toBe(true);
      expect(meetsMinimumVersion('^3.21.4', '3.0.0')).toBe(true);
      expect(meetsMinimumVersion('^4.0.0', '3.0.0')).toBe(true);
      expect(meetsMinimumVersion('~3.0.0', '3.0.0')).toBe(true);
      expect(meetsMinimumVersion('>=3.0.0', '3.0.0')).toBe(true);
    });

    it('should return false when version is below minimum', () => {
      expect(meetsMinimumVersion('^2.9.0', '3.0.0')).toBe(false);
      expect(meetsMinimumVersion('~2.99.0', '3.0.0')).toBe(false);
      expect(meetsMinimumVersion('2.0.0', '3.0.0')).toBe(false);
    });

    it('should return false for invalid version strings', () => {
      expect(meetsMinimumVersion('invalid', '3.0.0')).toBe(false);
      expect(meetsMinimumVersion('latest', '3.0.0')).toBe(false);
      expect(meetsMinimumVersion('', '3.0.0')).toBe(false);
    });

    it('should handle real-world examples', () => {
      // Zod: minimum 3.0.0
      expect(meetsMinimumVersion('^3.21.4', '3.0.0')).toBe(true);
      expect(meetsMinimumVersion('^2.9.0', '3.0.0')).toBe(false);

      // @eslint/markdown: minimum 6.0.0
      expect(meetsMinimumVersion('^7.4.0', '6.0.0')).toBe(true);
      expect(meetsMinimumVersion('^5.0.0', '6.0.0')).toBe(false);
    });
  });
});
