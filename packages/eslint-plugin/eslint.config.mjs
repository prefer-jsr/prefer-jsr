import baseConfig from '../../eslint.config.mjs';
import eslintPlugin from 'eslint-plugin-eslint-plugin';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.js'],
    ...eslintPlugin.configs['rules-recommended'],
  },
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
            '{projectRoot}/vite.config.{js,ts,mjs,mts}',
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    ignores: ['**/out-tsc'],
  },
];
