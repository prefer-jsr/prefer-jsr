import { RuleTester } from 'eslint';
import { preferJsrRule } from './rules/prefer-jsr.js';
import plugin from './eslint-plugin.js';
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
      // Package with hasBin flag - should not suggest JSR (JSR doesn't support bin)
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            gagen: '^0.1.0',
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

  // Test with ignore option (deprecated, backward compat)
  ruleTester.run('prefer-jsr with ignore option', preferJsrRule, {
    valid: [
      // ignore: package is skipped
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
      // ignore: works alongside exclude - both are respected
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            zod: '^3.21.4',
            hono: '^4.4.0',
          },
        }),
        options: [{ ignore: ['zod'], exclude: ['hono'] }],
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

  // Test with strict option
  ruleTester.run('prefer-jsr with strict option', preferJsrRule, {
    valid: [
      // strict does not affect packages already using JSR
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            '@david/gagen': 'jsr:^0.1.0',
          },
        }),
        options: [{ strict: true }],
      },
    ],
    invalid: [
      // strict: hasBin packages ARE reported
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            gagen: '^0.1.0',
          },
        }),
        options: [{ strict: true }],
        errors: [
          {
            messageId: 'preferJsr',
            data: {
              npmPackage: 'gagen',
              jsrPackage: '@david/gagen',
              jsrDependency: 'jsr:^0.1.0',
            },
          },
        ],
        output: JSON.stringify({
          dependencies: {
            '@david/gagen': 'jsr:^0.1.0',
          },
        }),
      },
    ],
  });

  // Test with include option
  ruleTester.run('prefer-jsr with include option', preferJsrRule, {
    valid: [
      // package in exclude overrides include
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            gagen: '^0.1.0',
          },
        }),
        options: [{ include: ['gagen'], exclude: ['gagen'] }],
      },
    ],
    invalid: [
      // include: hasBin package IS reported when explicitly included
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            gagen: '^0.1.0',
          },
        }),
        options: [{ include: ['gagen'] }],
        errors: [
          {
            messageId: 'preferJsr',
            data: {
              npmPackage: 'gagen',
              jsrPackage: '@david/gagen',
              jsrDependency: 'jsr:^0.1.0',
            },
          },
        ],
        output: JSON.stringify({
          dependencies: {
            '@david/gagen': 'jsr:^0.1.0',
          },
        }),
      },
      // include: package below minimum version IS reported when explicitly included
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            zod: '^2.0.0',
          },
        }),
        options: [{ include: ['zod'] }],
        errors: [
          {
            messageId: 'preferJsr',
            data: {
              npmPackage: 'zod',
              jsrPackage: '@zod/zod',
              jsrDependency: 'jsr:^2.0.0',
            },
          },
        ],
        output: JSON.stringify({
          dependencies: {
            '@zod/zod': 'jsr:^2.0.0',
          },
        }),
      },
    ],
  });

  // Test with exclude option
  ruleTester.run('prefer-jsr with exclude option', preferJsrRule, {
    valid: [
      // exclude: package is not reported even when it would normally match
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            zod: '^4.0.0',
          },
        }),
        options: [{ exclude: ['zod'] }],
      },
      // exclude overrides strict mode
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            gagen: '^0.1.0',
          },
        }),
        options: [{ strict: true, exclude: ['gagen'] }],
      },
    ],
    invalid: [],
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
      // Package with hasBin flag - should not suggest JSR (JSR doesn't support bin)
      {
        filename: 'package.json',
        code: JSON.stringify({
          dependencies: {
            gagen: '^0.1.0',
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
    },
  );
});

describe('plugin structure', () => {
  function isFlatConfig(config: unknown): config is {
    name?: string;
    files?: unknown;
    rules?: Record<string, unknown>;
  } {
    return typeof config === 'object' && config !== null && 'rules' in config;
  }
  it('should have a recommended config', () => {
    expect(plugin.configs).toBeDefined();
    expect(plugin.configs?.recommended).toBeDefined();
  });

  function getRecommendedConfig() {
    const rec = plugin.configs?.recommended;
    return Array.isArray(rec) ? rec[0] : rec;
  }

  it('recommended config should have a name', () => {
    const recommended = getRecommendedConfig();
    if (isFlatConfig(recommended)) {
      expect(recommended.name).toBe('prefer-jsr/recommended');
    }
  });

  it('recommended config should include files field', () => {
    const recommended = getRecommendedConfig();
    if (isFlatConfig(recommended)) {
      expect(recommended.files).toBeDefined();
      expect(recommended.files).toEqual(['**/package.json']);
    }
  });

  it('recommended config should include the prefer-jsr rule', () => {
    const recommended = getRecommendedConfig();
    if (isFlatConfig(recommended)) {
      expect(recommended.rules).toBeDefined();
      expect(recommended.rules?.['prefer-jsr/prefer-jsr']).toBe('error');
    }
  });
});
