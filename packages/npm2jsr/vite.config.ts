import { defineConfig } from 'vite';

export default defineConfig(() => ({
  cacheDir: '../../node_modules/.vite/npm2jsr',
  plugins: [],
  root: __dirname,
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  test: {
    coverage: {
      provider: 'v8' as const,
      reportsDirectory: './test-output/vitest/coverage',
    },
    environment: 'node',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    name: 'npm2jsr',
    reporters: ['default'],
    watch: false,
  },
}));
