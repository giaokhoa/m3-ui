import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        layout: 'src/layout/index.ts',
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: 'styles',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-aria-components',
        /^@m3-ui\/tokens(?:\/.*)?$/,
      ],
    },
  },
});
