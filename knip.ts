import type { KnipConfig } from 'knip';

export default {
  workspaces: {
    '.': {
      ignoreDependencies: [
        // Required peer dependency for @swc/core, which Nx uses for fast TypeScript compilation
        '@swc/helpers',

        // Required by Nx's `nx format` command for code formatting
        'prettier',

        // Required at runtime by @nx/eslint-plugin's flat config presets
        '@eslint/js',
        'typescript-eslint',
      ],
    },
  },
} satisfies KnipConfig;
