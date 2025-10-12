import { defineConfig } from 'eslint/config';
import nx from '@nx/eslint-plugin';
import packageJson from 'eslint-plugin-package-json';

// @ts-expect-error - TS2742: Known issue with defineConfig and pnpm, tracked at https://github.com/eslint/rewrite/issues/283
export default defineConfig([
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-deprecated': 'error',
    },
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            'eslint.config.mjs',
            'packages/*/eslint.config.mjs',
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-deprecated': 'error',
    },
  },
  // Package.json linting - root package.json (private monorepo)
  {
    ...packageJson.configs.recommended,
    files: ['package.json'],
    rules: {
      ...packageJson.configs.recommended.rules,
      'package-json/require-engines': 'error',
    },
  },
  // Package.json linting - publishable packages
  {
    ...packageJson.configs.recommended,
    files: ['packages/*/package.json'],
    rules: {
      ...packageJson.configs.recommended.rules,
      'package-json/require-author': 'error',
      'package-json/require-engines': 'error',
    },
  },
]);
