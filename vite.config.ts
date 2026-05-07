import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    optimizeDeps: {
      include: ['@appletosolutions/reactbits'],
    },
    define: {
      'process.env.OPENAI_COMPAT_API_KEY': JSON.stringify(env.OPENAI_COMPAT_API_KEY),
      'process.env.OPENAI_COMPAT_BASE_URL': JSON.stringify(env.OPENAI_COMPAT_BASE_URL),
      'process.env.OPENAI_COMPAT_MODEL': JSON.stringify(env.OPENAI_COMPAT_MODEL),
      'process.env.EXPORT_BACKEND_URL': JSON.stringify(env.EXPORT_BACKEND_URL),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api-proxy': {
          target: env.OPENAI_COMPAT_BASE_URL || 'https://api.moonshot.ai/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-proxy/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // 自动添加 Authorization header
              const apiKey = env.OPENAI_COMPAT_API_KEY;
              if (apiKey) {
                proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
              }
            });
          },
        },
        '/export-proxy': {
          target: env.EXPORT_BACKEND_URL || 'http://127.0.0.1:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/export-proxy/, ''),
        },
      },
    },
  };
});
