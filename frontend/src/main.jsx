import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder').catch(err => {
  console.warn('Stripe initialization failed:', err)
  return null
})

// Error Boundary Component for Production
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2)
    
    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorId: errorId
    })
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('🚨 Error caught by boundary:', error, errorInfo)
    }
    
    // In production, you might want to send this to an error reporting service
    if (import.meta.env.PROD) {
      console.error('Production Error ID:', errorId, error.message)
      // Example: sendToErrorReporting(error, errorInfo, errorId)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full text-center text-white border border-white/20">
            <div className="text-6xl mb-4">🚨</div>
            <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
            <p className="text-white/80 mb-6">
              We're sorry, but something unexpected happened. This error has been logged for investigation.
            </p>
            
            {this.state.errorId && (
              <div className="bg-white/5 rounded-lg p-3 mb-6">
                <p className="text-xs text-white/70 mb-1">Error ID:</p>
                <p className="text-sm font-mono text-white/90">{this.state.errorId}</p>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Reload Page
              </button>
            </div>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-red-300 mb-2 text-sm">
                  🔧 Error Details (Development Mode)
                </summary>
                <div className="bg-red-900/20 p-4 rounded text-xs overflow-auto text-red-200 max-h-32">
                  <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                  <br />
                  <strong>Component Stack:</strong>
                  <pre className="whitespace-pre-wrap text-xs mt-1">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Performance monitoring for development
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function && import.meta.env.DEV) {
    // Simple performance logging for development
    if ('performance' in window) {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0]
        if (perfData) {
          onPerfEntry({
            name: 'page-load',
            value: perfData.loadEventEnd - perfData.loadEventStart,
            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
          })
        }
      }, 0)
    }
  }
}

// Service Worker Registration for Production
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('🔧 SW registered:', registration.scope)
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 New version available! Please refresh.')
              // Could show a toast notification here
            }
          })
        }
      })
    } catch (error) {
      console.log('🚨 SW registration failed:', error)
    }
  }
}

// Initialize React App
const root = ReactDOM.createRoot(document.getElementById('root'))

// Enhanced Toaster Configuration for Production
const toasterConfig = {
  position: 'top-right',
  toastOptions: {
    duration: 4000,
    style: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      color: '#1a1a1a',
      fontWeight: '500',
      padding: '16px',
      fontSize: '14px',
      maxWidth: '400px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    success: {
      iconTheme: {
        primary: '#10B981',
        secondary: '#FFFFFF',
      },
      style: {
        border: '1px solid rgba(16, 185, 129, 0.2)',
      },
    },
    error: {
      iconTheme: {
        primary: '#EF4444',
        secondary: '#FFFFFF',
      },
      style: {
        border: '1px solid rgba(239, 68, 68, 0.2)',
      },
      duration: 6000, // Longer duration for errors
    },
    loading: {
      iconTheme: {
        primary: '#667eea',
        secondary: '#FFFFFF',
      },
      style: {
        border: '1px solid rgba(102, 126, 234, 0.2)',
      },
    },
  }
}

// Main Application Render
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Elements stripe={stripePromise}>
          <App />
          <Toaster {...toasterConfig} />
        </Elements>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)

// Performance monitoring in development
if (import.meta.env.DEV) {
  reportWebVitals((metric) => {
    console.log('📊 Performance metric:', metric)
  })
}

// Register service worker for production
registerServiceWorker()

// Global error handlers for production monitoring
window.addEventListener('error', (event) => {
  console.error('🚨 Global error:', event.error)
  
  // In production, you might want to send this to an error reporting service
  if (import.meta.env.PROD) {
    // Example: sendToErrorReporting(event.error)
  }
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason)
  
  // In production, you might want to send this to an error reporting service
  if (import.meta.env.PROD) {
    // Example: sendToErrorReporting(event.reason)
  }
})

// App initialization logging
console.log(`🚀 LeadGen Copilot started in ${import.meta.env.MODE} mode`)
if (import.meta.env.DEV) {
  console.log('🔗 API URL:', import.meta.env.VITE_API_URL)
  console.log('💳 Stripe Key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'Configured' : 'Not configured')
}

// Export for testing
export default root