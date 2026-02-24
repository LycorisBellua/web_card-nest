import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  ssr: {
    noExternal: true,
  },
  build: {
    ssr: 'src/main-server.tsx',
    outDir: '../backend/client/dist-ssr',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        format: 'cjs',
      },
    },
  },
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        plugins: [['babel-plugin-styled-components', { ssr: true }]],
      },
    })
  ],
});
