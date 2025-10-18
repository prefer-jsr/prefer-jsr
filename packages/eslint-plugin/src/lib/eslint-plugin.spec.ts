import { RuleTester } from 'eslint';
import { preferJsrRule } from './rules/prefer-jsr.js';
import json from '@eslint/json';
import * as jsoncParser from 'jsonc-eslint-parser';

const ruleTester = new RuleTester({
  plugins: {
    json,
  },
  language: 'json/json',
});

const legacyRuleTester = new RuleTester({
  languageOptions: {
    parser: jsoncParser,
  },
});

describe('prefer-jsr rule', () => {
  ruleTester.run('prefer-jsr', preferJsrRule, {
    valid: [
      // Already using JSR
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            '@zod/zod': 'jsr:^4.1.12',
          },
        }),
      },
      // Package not in mapping
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            'some-other-package': '^1.0.0',
          },
        }),
      },
      // Not a package.json file
      {
        filename: 'other.json',
        code: JSON.stringify({
          dependencies: {
            zod: '^4.1.12',
          },
        }),
      },
      // Npm version below minimum - should not warn
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            zod: '^2.9.0',
          },
        }),
      },
      // Npm @eslint/markdown version below minimum - should not warn
      {
        filename: 'package.json',
        code: JSON.stringify({
          devDependencies: {
            '@eslint/markdown': '^5.0.0',
          },
        }),
      },
    ],
    invalid: [
      // Simple mapping: zod -> @zod/zod
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            zod: '^4.1.12',
          },
        }),
        errors: [
          {
            messageId: 'preferJsr',
            data: {
              npmPackage: 'zod',
              jsrPackage: '@zod/zod',
              jsrDependency: 'jsr:^4.1.12',
            },
          },
        ],
        output: JSON.stringify({
          dependencies: {
            '@zod/zod': 'jsr:^4.1.12',
          },
        }),
      },
      // Direct mapping: @eslint/markdown -> @eslint/markdown
      {
        filename: 'package.json',
        code: JSON.stringify({
          devDependencies: {
            '@eslint/markdown': '^7.4.0',
          },
        }),
        errors: [
          {
            messageId: 'preferJsr',
            data: {
              npmPackage: '@eslint/markdown',
              jsrPackage: '@eslint/markdown',
              jsrDependency: 'jsr:^7.4.0',
            },
          },
        ],
        output: JSON.stringify({
          devDependencies: {
            '@eslint/markdown': 'jsr:^7.4.0',
          },
        }),
      },
      // Multiple dependencies with mixed scenarios
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            zod: '^4.1.12',
            'some-other-package': '^1.0.0',
            '@eslint/markdown': '^7.4.0',
          },
        }),
        errors: [
          {
            messageId: 'preferJsr',
            data: {
              npmPackage: 'zod',
              jsrPackage: '@zod/zod',
              jsrDependency: 'jsr:^4.1.12',
            },
          },
          {
            messageId: 'preferJsr',
            data: {
              npmPackage: '@eslint/markdown',
              jsrPackage: '@eslint/markdown',
              jsrDependency: 'jsr:^7.4.0',
            },
          },
        ],
        output: JSON.stringify({
          dependencies: {
            '@zod/zod': 'jsr:^4.1.12',
            'some-other-package': '^1.0.0',
            '@eslint/markdown': 'jsr:^7.4.0',
          },
        }),
      },
      // Test with peerDependencies
      {
        filename: 'package.json',
        code: JSON.stringify({
          peerDependencies: {
            zod: '>=4.0.0',
          },
        }),
        errors: [
          {
            messageId: 'preferJsr',
            data: {
              npmPackage: 'zod',
              jsrPackage: '@zod/zod',
              jsrDependency: 'jsr:>=4.0.0',
            },
          },
        ],
        output: JSON.stringify({
          peerDependencies: {
            '@zod/zod': 'jsr:>=4.0.0',
          },
        }),
      },
    ],
  });

  // Test with ignore option
  ruleTester.run('prefer-jsr with ignore option', preferJsrRule, {
    valid: [
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            zod: '^3.21.4',
          },
        }),
        options: [
          {
            ignore: ['zod'],
          },
        ],
      },
    ],
    invalid: [
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            zod: '^3.21.4',
            '@eslint/markdown': '^5.0.0',
          },
        }),
        options: [
          {
            ignore: ['@eslint/markdown'],
          },
        ],
        errors: [
          {
            messageId: 'preferJsr',
            data: {
              npmPackage: 'zod',
              jsrPackage: '@zod/zod',
              jsrDependency: 'jsr:^3.21.4',
            },
          },
        ],
        output: JSON.stringify({
          dependencies: {
            '@zod/zod': 'jsr:^3.21.4',
            '@eslint/markdown': '^5.0.0',
          },
        }),
      },
    ],
  });
});

describe('prefer-jsr rule with legacy jsonc-eslint-parser', () => {
  legacyRuleTester.run('prefer-jsr (legacy)', preferJsrRule, {
    valid: [
      // Already using JSR
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            '@zod/zod': 'jsr:^4.1.12',
          },
        }),
      },
      // Package not in mapping
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            'some-other-package': '^1.0.0',
          },
        }),
      },
      // Not a package.json file
      {
        filename: 'other.json',
        code: JSON.stringify({
          dependencies: {
            zod: '^4.1.12',
          },
        }),
      },
      // Npm version below minimum - should not warn
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            zod: '^2.9.0',
          },
        }),
      },
      // Npm @eslint/markdown version below minimum - should not warn
      {
        filename: 'package.json',
        code: JSON.stringify({
          devDependencies: {
            '@eslint/markdown': '^5.0.0',
          },
        }),
      },
    ],
    invalid: [
      // Simple mapping: zod -> @zod/zod
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            zod: '^4.1.12',
          },
        }),
        errors: [
          {
            messageId: 'preferJsr',
            data: {
              npmPackage: 'zod',
              jsrPackage: '@zod/zod',
              jsrDependency: 'jsr:^4.1.12',
            },
          },
        ],
        output: JSON.stringify({
          dependencies: {
            '@zod/zod': 'jsr:^4.1.12',
          },
        }),
      },
      // Direct mapping: @eslint/markdown -> @eslint/markdown
      {
        filename: 'package.json',
        code: JSON.stringify({
          devDependencies: {
            '@eslint/markdown': '^7.4.0',
          },
        }),
        errors: [
          {
            messageId: 'preferJsr',
            data: {
              npmPackage: '@eslint/markdown',
              jsrPackage: '@eslint/markdown',
              jsrDependency: 'jsr:^7.4.0',
            },
          },
        ],
        output: JSON.stringify({
          devDependencies: {
            '@eslint/markdown': 'jsr:^7.4.0',
          },
        }),
      },
      // Multiple dependencies with mixed scenarios
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            zod: '^4.1.12',
            'some-other-package': '^1.0.0',
            '@eslint/markdown': '^7.4.0',
          },
        }),
        errors: [
          {
            messageId: 'preferJsr',
            data: {
              npmPackage: 'zod',
              jsrPackage: '@zod/zod',
              jsrDependency: 'jsr:^4.1.12',
            },
          },
          {
            messageId: 'preferJsr',
            data: {
              npmPackage: '@eslint/markdown',
              jsrPackage: '@eslint/markdown',
              jsrDependency: 'jsr:^7.4.0',
            },
          },
        ],
        output: JSON.stringify({
          dependencies: {
            '@zod/zod': 'jsr:^4.1.12',
            'some-other-package': '^1.0.0',
            '@eslint/markdown': 'jsr:^7.4.0',
          },
        }),
      },
      // Test with peerDependencies
      {
        filename: 'package.json',
        code: JSON.stringify({
          peerDependencies: {
            zod: '>=4.0.0',
          },
        }),
        errors: [
          {
            messageId: 'preferJsr',
            data: {
              npmPackage: 'zod',
              jsrPackage: '@zod/zod',
              jsrDependency: 'jsr:>=4.0.0',
            },
          },
        ],
        output: JSON.stringify({
          peerDependencies: {
            '@zod/zod': 'jsr:>=4.0.0',
          },
        }),
      },
    ],
  });

  // Test with ignore option (legacy parser)
  legacyRuleTester.run(
    'prefer-jsr with ignore option (legacy)',
    preferJsrRule,
    {
      valid: [
        {
          filename: 'package.json',
          code: JSON.stringify({
            dependencies: {
              zod: '^3.21.4',
            },
          }),
          options: [
            {
              ignore: ['zod'],
            },
          ],
        },
      ],
      invalid: [
        {
          filename: 'package.json',
          code: JSON.stringify({
            dependencies: {
              zod: '^3.21.4',
              '@eslint/markdown': '^5.0.0',
            },
          }),
          options: [
            {
              ignore: ['@eslint/markdown'],
            },
          ],
          errors: [
            {
              messageId: 'preferJsr',
              data: {
                npmPackage: 'zod',
                jsrPackage: '@zod/zod',
                jsrDependency: 'jsr:^3.21.4',
              },
            },
          ],
          output: JSON.stringify({
            dependencies: {
              '@zod/zod': 'jsr:^3.21.4',
              '@eslint/markdown': '^5.0.0',
            },
          }),
        },
      ],
    }
  );
});
