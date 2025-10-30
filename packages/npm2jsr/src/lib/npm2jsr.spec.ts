import { describe, expect, it } from 'vitest';

import {
  getAvailableNpmPackages,
  getJsrEquivalent,
  getJsrPackageInfo,
  hasJsrEquivalent,
  npmToJsrMapping,
  toJsrDependency,
} from './npm2jsr.js';

describe('npm2jsr', () => {
  describe('npmToJsrMapping', () => {
    it('should be a Map instance', () => {
      expect(npmToJsrMapping).toBeInstanceOf(Map);
    });

    it('should contain known mappings with metadata', () => {
      const zodInfo = npmToJsrMapping.get('zod');
      expect(zodInfo?.jsrPackage).toBe('@zod/zod');
      expect(zodInfo?.minimumVersion).toBe('3.0.0');
      expect(zodInfo?.sourceUrl).toBe('https://github.com/colinhacks/zod');

      const eslintInfo = npmToJsrMapping.get('@eslint/markdown');
      expect(eslintInfo?.jsrPackage).toBe('@eslint/markdown');
      expect(eslintInfo?.minimumVersion).toBe('6.0.0');
      expect(eslintInfo?.sourceUrl).toBe('https://github.com/eslint/markdown');

      const openaiInfo = npmToJsrMapping.get('@openai/openai');
      expect(openaiInfo?.jsrPackage).toBe('@openai/openai');
      expect(openaiInfo?.minimumVersion).toBe('4.47.1');
      expect(openaiInfo?.sourceUrl).toBe('https://github.com/openai/openai-node');
    });
  });

  describe('getJsrEquivalent', () => {
    it('should return JSR equivalent for mapped packages', () => {
      expect(getJsrEquivalent('zod')).toBe('@zod/zod');
      expect(getJsrEquivalent('@eslint/markdown')).toBe('@eslint/markdown');
      expect(getJsrEquivalent('@openai/openai')).toBe('@openai/openai');
    });

    it('should return null for unmapped packages', () => {
      expect(getJsrEquivalent('unknown-package')).toBe(null);
      expect(getJsrEquivalent('react')).toBe(null);
    });
  });

  describe('getJsrPackageInfo', () => {
    it('should return full package info for mapped packages', () => {
      const zodInfo = getJsrPackageInfo('zod');
      expect(zodInfo).toEqual({
        jsrPackage: '@zod/zod',
        minimumVersion: '3.0.0',
        sourceUrl: 'https://github.com/colinhacks/zod',
      });
    });

    it('should return null for unmapped packages', () => {
      expect(getJsrPackageInfo('unknown-package')).toBe(null);
    });
  });

  describe('toJsrDependency', () => {
    it('should prefix version with jsr:', () => {
      expect(toJsrDependency('^4.1.12')).toBe('jsr:^4.1.12');
      expect(toJsrDependency('>=1.0.0')).toBe('jsr:>=1.0.0');
      expect(toJsrDependency('~2.3.4')).toBe('jsr:~2.3.4');
    });
  });

  describe('getAvailableNpmPackages', () => {
    it('should return array of all mapped npm packages', () => {
      const packages = getAvailableNpmPackages();
      expect(packages).toContain('zod');
      expect(packages).toContain('@eslint/markdown');
      expect(packages).toContain('@openai/openai');
      expect(packages.length).toBeGreaterThan(0);
    });
  });

  describe('hasJsrEquivalent', () => {
    it('should return true for mapped packages', () => {
      expect(hasJsrEquivalent('zod')).toBe(true);
      expect(hasJsrEquivalent('@eslint/markdown')).toBe(true);
      expect(hasJsrEquivalent('@openai/openai')).toBe(true);
    });

    it('should return false for unmapped packages', () => {
      expect(hasJsrEquivalent('unknown-package')).toBe(false);
      expect(hasJsrEquivalent('react')).toBe(false);
    });
  });
});
