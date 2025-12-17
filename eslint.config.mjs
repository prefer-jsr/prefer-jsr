import nx from '@nx/eslint-plugin';
import packageJson from 'eslint-plugin-package-json';
import perfectionist from 'eslint-plugin-perfectionist';
import { defineConfig, globalIgnores } from 'eslint/config';

// @ts-expect-error - TS2742: Known issue with defineConfig and pnpm, tracked at https://github.com/eslint/rewrite/issues/283
export default defineConfig([
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  globalIgnores(
    [
      '**/dist',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
      '**/__fixtures__/**',
    ],
    'Global Ignores'
  ),
  {
    name: 'Sort All Js and Ts Files Except Tests',
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    ignores: ['**/*.spec.ts', '**/*.spec.js', '**/*.test.ts', '**/*.test.js'],
    plugins: {
      perfectionist,
    },
    rules: {
      ...perfectionist.configs['recommended-natural'].rules,
    },
  },
  {
    name: 'Sort Eslint Config Custom Order',
    files: ['**/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
    rules: {
      'perfectionist/sort-objects': [
        'error',
        {
          customGroups: {
            name: 'name',
          },
          groups: ['name', 'unknown'],
          type: 'natural',
        },
      ],
    },
  },
  {
    name: 'Nx module boundaries',
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              onlyDependOnLibsWithTags: ['*'],
              sourceTag: '*',
            },
          ],
          enforceBuildableLibDependency: true,
        },
      ],
    },
  },
  {
    name: 'Type-Checking Rules for All Files',
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
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
    name: 'Root Package json file',
    ...packageJson.configs.recommended,
    files: ['package.json'],
    rules: {
      ...packageJson.configs.recommended.rules,
      'package-json/require-engines': 'error',
    },
  },
  {
    name: 'Publishable Packages Package json files',
    ...packageJson.configs.recommended,
    files: ['packages/*/package.json'],
    rules: {
      ...packageJson.configs.recommended.rules,
      'package-json/require-author': 'error',
      'package-json/require-engines': 'error',
    },
  },
]);
