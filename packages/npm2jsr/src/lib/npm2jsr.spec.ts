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
    });

    it('should contain supabase packages with correct minimum versions', () => {
      const supabaseJsInfo = npmToJsrMapping.get('@supabase/supabase-js');
      expect(supabaseJsInfo?.jsrPackage).toBe('@supabase/supabase-js');
      expect(supabaseJsInfo?.minimumVersion).toBe('2.58.0');
      expect(supabaseJsInfo?.sourceUrl).toBe(
        'https://github.com/supabase/supabase-js'
      );

      const functionsJsInfo = npmToJsrMapping.get('@supabase/functions-js');
      expect(functionsJsInfo?.jsrPackage).toBe('@supabase/functions-js');
      expect(functionsJsInfo?.minimumVersion).toBe('2.85.0');
      expect(functionsJsInfo?.sourceUrl).toBe(
        'https://github.com/supabase/supabase-js/tree/master/packages/core/functions-js'
      );
    });
  });

  describe('getJsrEquivalent', () => {
    it('should return JSR equivalent for mapped packages', () => {
      expect(getJsrEquivalent('zod')).toBe('@zod/zod');
      expect(getJsrEquivalent('@eslint/markdown')).toBe('@eslint/markdown');
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
      expect(packages.length).toBeGreaterThan(0);
    });
  });

  describe('hasJsrEquivalent', () => {
    it('should return true for mapped packages', () => {
      expect(hasJsrEquivalent('zod')).toBe(true);
      expect(hasJsrEquivalent('@eslint/markdown')).toBe(true);
    });

    it('should return false for unmapped packages', () => {
      expect(hasJsrEquivalent('unknown-package')).toBe(false);
      expect(hasJsrEquivalent('react')).toBe(false);
    });
  });
});
