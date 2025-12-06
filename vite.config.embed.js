import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Vite config for building the chat embed bundle
 *
 * Usage: npx vite build --config vite.config.embed.js
 *
 * Output: build/embed/chat-embed.js
 */
export default defineConfig({
  plugins: [react()],

  build: {
    outDir: 'build/embed',
    assetsDir: '.',
    emptyOutDir: true,

    rollupOptions: {
      input: {
        'chat-embed': path.resolve(__dirname, 'src/embed/chat-embed.jsx')
      },
      output: {
        entryFileNames: 'chat-embed.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        // Bundle React into the output (for standalone embed)
        manualChunks: undefined
      }
    },

    // Inline CSS into JS for single-file embed
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

  // Base URL for embed (relative)
  base: './'
})
