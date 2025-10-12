import type { KnipConfig } from 'knip';

export default {
  ignoreDependencies: [
    // Required peer dependency for @swc/core, which Nx uses for fast TypeScript compilation
    '@swc/helpers',

    // Required by Nx's `nx format` command for code formatting
    'prettier',

    // Required at runtime by @nx/eslint-plugin's flat config presets
    // (not just for types - the package imports it directly)
    'typescript-eslint',
  ],
} satisfies KnipConfig;
