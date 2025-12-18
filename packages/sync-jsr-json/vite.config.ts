import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  cacheDir: '../../node_modules/.vite/packages/sync-jsr-json',
  plugins: [nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  root: __dirname,
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  test: {
    coverage: {
      provider: 'v8' as const,
      reportsDirectory: '../../coverage/packages/sync-jsr-json',
    },
    environment: 'node',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    name: 'sync-jsr-json',
    reporters: ['default'],
    watch: false,
  },
}));
