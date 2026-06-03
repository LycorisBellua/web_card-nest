import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
  '/socket.io': {
    target: 'http://localhost:3000',
    ws: true,
    changeOrigin: true,
  },
},
  },
  build: {
    outDir: '../backend/client/dist',
    emptyOutDir: true,
  },
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        plugins: [['babel-plugin-styled-components', { ssr: true }]],
      },
    }),
  ],
});
