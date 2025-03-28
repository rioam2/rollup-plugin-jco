/// <reference types="vite" />

import { defineConfig } from 'vitest/config';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import packageJson from './package.json';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

export default defineConfig({
  appType: 'custom',
  base: './',
  define: {
    'globalThis.globalVersion': `"${packageJson.version}"`,
    'globalThis.globalPluginName': `"${packageJson.name}"`,
  },
  build: {
    sourcemap: true,
    lib: {
      entry: 'src/index.ts',
      name: 'rollup-plugin-jco',
      fileName: 'index',
    },
    rollupOptions: {
      input: 'src/index.ts',
      treeshake: 'smallest',
      output: {
        dir: 'dist',
        format: 'esm',
        name: 'rollup-plugin-jco',
        globals: {
          fs: 'fs',
          path: 'path',
          crypto: 'crypto',
        },
      },
    },
  },
  plugins: [
    checker({ typescript: true }),
    dts({ rollupTypes: true }),
    externalizeDeps({
      deps: false,
      devDeps: true,
      peerDeps: true,
      nodeBuiltins: true,
    }),
  ],
  test: {
    include: ['test/**/*.test.ts', '**/*.test.ts'],
    globals: true,
    typecheck: {
      enabled: true,
      checker: 'tsc',
      tsconfig: 'tsconfig.vitest.json',
    },
  },
});
