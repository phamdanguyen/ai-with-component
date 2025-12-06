import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Vite config for building BubbleChat widget bundle
 *
 * Usage: npx vite build --config vite.config.bubble.js
 *
 * Output: build/bubble/bubble-widget.js
 *
 * This creates a standalone React bundle that replaces
 * the Vanilla JS website_ai_chat_widget.js
 */
export default defineConfig({
  plugins: [react()],

  build: {
    outDir: 'build/bubble',
    assetsDir: '.',
    emptyOutDir: true,

    rollupOptions: {
      input: {
        'bubble-widget': path.resolve(__dirname, 'src/embed/bubble-widget.jsx')
      },
      output: {
        entryFileNames: 'bubble-widget.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        // Bundle everything for standalone widget
        manualChunks: undefined
      }
    },

    // Inline CSS into JS
    cssCodeSplit: false,

    sourcemap: false,
    minify: 'esbuild'
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@shared': path.resolve(__dirname, './src/shared')
    }
  },

  // Base URL for Odoo static files
  base: '/odoo_ai_chat/static/superchat/build/bubble/'
})
