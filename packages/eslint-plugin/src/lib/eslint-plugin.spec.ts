import json from '@eslint/json';
import { RuleTester } from 'eslint';

import { preferJsrRule } from './rules/prefer-jsr.js';

const ruleTester = new RuleTester({
  language: 'json/json',
  plugins: {
    json,
  },
});

describe('prefer-jsr rule', () => {
  ruleTester.run('prefer-jsr', preferJsrRule, {
    invalid: [
      // Simple mapping: zod -> @zod/zod
      {
        code: JSON.stringify({
          dependencies: {
            zod: '^4.1.12',
          },
        }),
        errors: [
          {
            data: {
              jsrDependency: 'jsr:^4.1.12',
              jsrPackage: '@zod/zod',
              npmPackage: 'zod',
            },
            messageId: 'preferJsr',
          },
        ],
        filename: 'package.json',
        output: JSON.stringify({
          dependencies: {
            '@zod/zod': 'jsr:^4.1.12',
          },
        }),
      },
      // Direct mapping: @eslint/markdown -> @eslint/markdown
      {
        code: JSON.stringify({
          devDependencies: {
            '@eslint/markdown': '^7.4.0',
          },
        }),
        errors: [
          {
            data: {
              jsrDependency: 'jsr:^7.4.0',
              jsrPackage: '@eslint/markdown',
              npmPackage: '@eslint/markdown',
            },
            messageId: 'preferJsr',
          },
        ],
        filename: 'package.json',
        output: JSON.stringify({
          devDependencies: {
            '@eslint/markdown': 'jsr:^7.4.0',
          },
        }),
      },
      // Multiple dependencies with mixed scenarios
      {
        code: JSON.stringify({
          dependencies: {
            '@eslint/markdown': '^7.4.0',
            'some-other-package': '^1.0.0',
            zod: '^4.1.12',
          },
        }),
        errors: [
          {
            data: {
              jsrDependency: 'jsr:^4.1.12',
              jsrPackage: '@zod/zod',
              npmPackage: 'zod',
            },
            messageId: 'preferJsr',
          },
          {
            data: {
              jsrDependency: 'jsr:^7.4.0',
              jsrPackage: '@eslint/markdown',
              npmPackage: '@eslint/markdown',
            },
            messageId: 'preferJsr',
          },
        ],
        filename: 'package.json',
        output: JSON.stringify({
          dependencies: {
            '@eslint/markdown': 'jsr:^7.4.0',
            '@zod/zod': 'jsr:^4.1.12',
            'some-other-package': '^1.0.0',
          },
        }),
      },
      // Test with peerDependencies
      {
        code: JSON.stringify({
          peerDependencies: {
            zod: '>=4.0.0',
          },
        }),
        errors: [
          {
            data: {
              jsrDependency: 'jsr:>=4.0.0',
              jsrPackage: '@zod/zod',
              npmPackage: 'zod',
            },
            messageId: 'preferJsr',
          },
        ],
        filename: 'package.json',
        output: JSON.stringify({
          peerDependencies: {
            '@zod/zod': 'jsr:>=4.0.0',
          },
        }),
      },
    ],
    valid: [
      // Already using JSR
      {
        code: JSON.stringify({
          dependencies: {
            '@zod/zod': 'jsr:^4.1.12',
          },
        }),
        filename: 'package.json',
      },
      // Package not in mapping
      {
        code: JSON.stringify({
          dependencies: {
            'some-other-package': '^1.0.0',
          },
        }),
        filename: 'package.json',
      },
      // Not a package.json file
      {
        code: JSON.stringify({
          dependencies: {
            zod: '^4.1.12',
          },
        }),
        filename: 'other.json',
      },
      // Npm version below minimum - should not warn
      {
        code: JSON.stringify({
          dependencies: {
            zod: '^2.9.0',
          },
        }),
        filename: 'package.json',
      },
      // Npm @eslint/markdown version below minimum - should not warn
      {
        code: JSON.stringify({
          devDependencies: {
            '@eslint/markdown': '^5.0.0',
          },
        }),
        filename: 'package.json',
      },
    ],
  });

  // Test with custom mappings
  ruleTester.run('prefer-jsr with custom mappings', preferJsrRule, {
    invalid: [
      {
        code: JSON.stringify({
          dependencies: {
            'my-custom-package': '^1.0.0',
          },
        }),
        errors: [
          {
            data: {
              jsrDependency: 'jsr:^1.0.0',
              jsrPackage: '@my/custom-package',
              npmPackage: 'my-custom-package',
            },
            messageId: 'preferJsr',
          },
        ],
        filename: 'package.json',
        options: [
          {
            customMappings: {
              'my-custom-package': '@my/custom-package',
            },
          },
        ],
        output: JSON.stringify({
          dependencies: {
            '@my/custom-package': 'jsr:^1.0.0',
          },
        }),
      },
    ],
    valid: [
      {
        code: JSON.stringify({
          dependencies: {
            'my-custom-package': '^1.0.0',
          },
        }),
        filename: 'package.json',
        options: [
          {
            customMappings: {
              'other-package': '@other/package',
            },
          },
        ],
      },
    ],
  });

  // Test with ignore option
  ruleTester.run('prefer-jsr with ignore option', preferJsrRule, {
    invalid: [
      {
        code: JSON.stringify({
          dependencies: {
            '@eslint/markdown': '^5.0.0',
            zod: '^3.21.4',
          },
        }),
        errors: [
          {
            data: {
              jsrDependency: 'jsr:^3.21.4',
              jsrPackage: '@zod/zod',
              npmPackage: 'zod',
            },
            messageId: 'preferJsr',
          },
        ],
        filename: 'package.json',
        options: [
          {
            ignore: ['@eslint/markdown'],
          },
        ],
        output: JSON.stringify({
          dependencies: {
            '@eslint/markdown': '^5.0.0',
            '@zod/zod': 'jsr:^3.21.4',
          },
        }),
      },
    ],
    valid: [
      {
        code: JSON.stringify({
          dependencies: {
            zod: '^3.21.4',
          },
        }),
        filename: 'package.json',
        options: [
          {
            ignore: ['zod'],
          },
        ],
      },
    ],
  });
});
