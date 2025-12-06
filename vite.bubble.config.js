import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Vite config for BubbleChat widget build
 *
 * Build separately from main app for:
 * - Smaller bundle size
 * - Independent deployment
 * - Embed on any page
 *
 * Usage: vite build --config vite.bubble.config.js
 */
export default defineConfig({
  plugins: [react()],

  build: {
    outDir: 'build/bubble',
    emptyOutDir: true,

    rollupOptions: {
      input: {
        'bubble-widget': path.resolve(__dirname, 'src/embed/bubble-widget.jsx')
      },
      output: {
        entryFileNames: 'bubble-widget.js',
        chunkFileNames: '[name].js',
        assetFileNames: 'style.[ext]'
      }
    },

    // Inline CSS for single-file deployment
    cssCodeSplit: false,

    sourcemap: true,
    minify: 'esbuild'
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  },

  // Base URL for Odoo
  base: '/odoo_ai_chat/static/superchat/build/bubble/'
})
