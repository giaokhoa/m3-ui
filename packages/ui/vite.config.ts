import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createRuntimeExternalPredicate } from './scripts/runtime-externals.mjs';

const packageManifest = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

export default defineConfig({
  plugins: [react()],
  ssr: {
    noExternal: ['@material/material-color-utilities'],
  },
  build: {
    // Vite 8/Lightning CSS lowers :dir() for older Chromium targets into
    // language selectors, which is not equivalent to DOM directionality.
    cssTarget: ['chrome120', 'edge120', 'firefox114', 'safari16.4', 'ios16.4'],
    lib: {
      entry: {
        index: 'src/index.ts',
        layout: 'src/layout/index.ts',
        typography: 'src/theme/typography/typeScale.ts',
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: 'styles',
    },
    rollupOptions: {
      external: createRuntimeExternalPredicate(packageManifest),
    },
  },
});
