import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-64x64.svg', 'pwa-192x192.svg', 'pwa-512x512.svg'],
      manifest: {
        name: '金库 · 本地 AI 创作工坊',
        short_name: '金库',
        description: '完全运行于浏览器端的一站式 AI 创作工具。WebGPU 端侧推理，数据零上传，全场景离线可用。',
        theme_color: '#0e0d0b',
        background_color: '#0e0d0b',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        start_url: '/',
        scope: '/',
        orientation: 'any',
        lang: 'zh-CN',
        categories: ['productivity', 'utilities'],
        icons: [
          { src: 'pwa-64x64.svg', sizes: '64x64', type: 'image/svg+xml' },
          { src: 'pwa-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'pwa-512x512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
          { src: 'pwa-512x512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: '文本创作', url: '/text', icons: [{ src: 'pwa-64x64.svg', sizes: '64x64' }] },
          { name: '图像工坊', url: '/image', icons: [{ src: 'pwa-64x64.svg', sizes: '64x64' }] },
          { name: '代码辅助', url: '/code', icons: [{ src: 'pwa-64x64.svg', sizes: '64x64' }] },
        ],
        screenshots: [
          { src: 'screenshot.png', sizes: '1280x720', type: 'image/png', form_factor: 'wide' },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 7 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-static',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  server: { port: 5173, open: true },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'web-llm': ['@mlc-ai/web-llm'],
        },
      },
    },
  },
})
