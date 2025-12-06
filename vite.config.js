import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Build configuration for Odoo integration
  build: {
    outDir: 'build',
    assetsDir: 'assets',
    emptyOutDir: true,

    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/main.jsx'),
        'bubble/bubble-widget': path.resolve(__dirname, 'src/embed/bubble-widget.jsx')
      },
      output: {
        // Use consistent naming for Odoo asset loading
        entryFileNames: (chunkInfo) => {
          // Special handling for bubble widget
          if (chunkInfo.name === 'bubble/bubble-widget') {
            return 'bubble/bubble-widget.js';
          }
          return 'assets/index.js';
        },
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',

        // DISABLED: manualChunks causes React hooks error due to module resolution conflict
        // All vendor libraries now bundled together to ensure single React instance
        manualChunks: undefined
      }
    },

    // Sprint C - Story C3.1: Increase warning limit after optimization
    chunkSizeWarningLimit: 600,

    // Sourcemaps for debugging
    sourcemap: true,

    // Minify for production (using esbuild - faster and included in Vite)
    minify: 'esbuild'
  },

  // Development server configuration
  server: {
    port: 3000,
    strictPort: false,

    // Proxy API requests to Odoo
    proxy: {
      '/superchat/api': {
        target: 'http://localhost:8069',
        changeOrigin: true,
        secure: false
      }
    }
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils')
    },
    // Fix React hooks error - deduplicate React instances
    dedupe: ['react', 'react-dom', 'react-router-dom']
  },

  // Optimize deps to prevent duplicate React
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: []
  },

  // Base URL for standalone app
  base: '/',
})
