import path from 'path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import vueDevTools from 'vite-plugin-vue-devtools'
import { Notify } from 'quasar'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({
      sassVariables: path.resolve('src/quasar-variables.sass') 
    }),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate', // actualiza PWA automáticamente
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5 MB
      },
      manifest: {
        name: 'Pos Local PWA',
        short_name: 'Punto de venta Local',
        description: 'Punto de venta sin necesidad de utilizar internet para funcionar',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/1.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/1.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/1.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],


  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
