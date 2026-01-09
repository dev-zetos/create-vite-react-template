import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { chunkSplitPlugin } from 'vite-plugin-chunk-split';
import eslintPlugin from 'vite-plugin-eslint';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    chunkSplitPlugin({
      customSplitting: {
        'react-vendor': [/node_modules\/react/, /node_modules\/react-dom/],
        utils: [/src\/utils/, /src\/components/],
      },
    }),
    eslintPlugin(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(__dirname, 'src/assets/svg')],
      symbolId: 'icon-[dir]-[name]',
      inject: 'body-last',
      customDomId: '__svg_icons',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '^/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    sourcemap: true,
    minify: 'terser',
  },
  esbuild: {
    pure: ['console'],
  },
});
