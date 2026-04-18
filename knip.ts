import type { KnipConfig } from 'knip';

export default {
  workspaces: {
    '.': {
      ignoreDependencies: [
        // Required by Nx's `nx format` command for code formatting
        'prettier',

        // Required at runtime by @nx/eslint-plugin's flat config presets
        '@eslint/js',
        'typescript-eslint',
      ],
    },
  },
} satisfies KnipConfig;
