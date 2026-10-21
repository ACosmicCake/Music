import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// BASE_PATH lets the GitHub Pages build live under /<repo>/; locally it is '/'.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  build: { target: 'es2020' },
  worker: { format: 'es' },
  plugins: [
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'World Woodshed',
        short_name: 'Woodshed',
        description: 'Practice guitar, ear training, rhythm and world music with a daily routine that adapts to you.',
        theme_color: '#18201c',
        background_color: '#eef0ea',
        display: 'standalone',
        orientation: 'any',
        start_url: '.',
        scope: '.',
        categories: ['music', 'education'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        shortcuts: [
          { name: 'Today', url: '.#today' },
          { name: 'On the go', url: '.#go' },
          { name: 'Transcribe', url: '.#transcribe' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true
      }
    })
  ]
});
