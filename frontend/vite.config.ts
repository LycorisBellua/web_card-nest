import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    server: {
      proxy: {
        '/api/': env.VITE_HOME_URL,
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
  };
});
