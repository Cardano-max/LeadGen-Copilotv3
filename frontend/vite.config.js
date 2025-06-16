import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Include .jsx files
      include: "**/*.{jsx,tsx}",
    })
  ],
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@utils': resolve(__dirname, './src/utils'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@assets': resolve(__dirname, './src/assets'),
    },
  },
  
  // Development server configuration
  server: {
    port: 3000,
    host: true, // Allow external connections
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:10000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  
  // Preview server configuration (for production testing)
  preview: {
    port: 4173,
    host: true,
    cors: true
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable for production
    minify: 'esbuild', // Faster than terser
    target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
    
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for stable caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // Animation libraries
          animations: ['framer-motion'],
          
          // UI libraries
          ui: [
            'lucide-react', 
            'react-hot-toast', 
            'react-intersection-observer'
          ],
          
          // Payment libraries
          payments: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          
          // HTTP client
          http: ['axios']
        },
        
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash][extname]`
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        
        // Chunk file naming
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js'
      }
    },
    
    // Build optimizations
    cssCodeSplit: true,
    reportCompressedSize: false, // Faster builds
    chunkSizeWarningLimit: 1000, // 1MB warning limit
    
    // Compression settings
    assetsInlineLimit: 4096, // 4KB inline limit
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react',
      'react-hot-toast',
      'react-intersection-observer',
      'axios'
    ],
    exclude: [
      // Exclude any problematic dependencies
    ]
  },
  
  // CSS configuration
  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    },
    postcss: {
      plugins: [
        // PostCSS plugins are configured in postcss.config.js
      ]
    }
  },
  
  // Environment variables
  define: {
    // Make env variables available to the app
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  
  // Public directory
  publicDir: 'public',
  
  // Base URL (useful for deployment to subdirectories)
  base: '/',
  
  // Asset handling
  assetsInclude: ['**/*.xml', '**/*.txt'],
  
  // Worker configuration
  worker: {
    format: 'es'
  },
  
  // JSON configuration
  json: {
    namedExports: true,
    stringify: false
  },
  
  // ESBuild configuration
  esbuild: {
    // Remove console.log in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // JSX configuration
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    target: 'es2015'
  },
  
  // Legacy browser support
  legacy: {
    buildSsrCjsExternalHeuristics: false
  },
  
  // Experimental features
  experimental: {
    buildAdvancedBaseOptions: true
  },
  
  // Plugin-specific configurations
  react: {
    babel: {
      plugins: [
        // Add any babel plugins here if needed
      ]
    }
  }
})