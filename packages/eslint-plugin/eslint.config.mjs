import baseConfig from '../../eslint.base.config.mjs';
import eslintPlugin from 'eslint-plugin-eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.js'],
    ...eslintPlugin.configs['rules-recommended'],
  },
  {
    files: ['**/*.json'],
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          checkMissingDependencies: true,
          ignoredDependencies: [
            'tslib',
            '@eslint/json',
            '@humanwhocodes/momoa',
            'jsonc-eslint-parser',
          ],
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
            '{projectRoot}/vite.config.{js,ts,mjs,mts}',
          ],
        },
      ],
    },
  },
  {
    ignores: ['**/out-tsc'],
  },
];
