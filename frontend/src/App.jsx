import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useScroll, useSpring, useTransform, useInView, AnimatePresence, useAnimation } from 'framer-motion'
import { InView } from 'react-intersection-observer'
import toast from 'react-hot-toast'
import axios from 'axios'
import { 
  Menu, X, ChevronDown, ChevronRight, Play, Pause, Download, Upload, 
  MapPin, Mail, MessageSquare, Users, Zap, Target, BarChart3, 
  Globe, Smartphone, Laptop, Star, Check, ArrowRight, ExternalLink,
  Search, Filter, Database, Bot, Send, Phone, Linkedin, Instagram,
  Shield, Lock, Sparkles, Rocket, TrendingUp, DollarSign, Clock,
  Settings, User, LogIn, LogOut, Heart, Share2, Copy, Eye, EyeOff,
  FileText, PieChart, LineChart, Activity, Briefcase, Award,
  Monitor, Github, Twitter, Facebook, Youtube,
  Code, Terminal, Server, Cloud, Cpu, HardDrive, Wifi, Bluetooth
} from 'lucide-react'

// ===== PRODUCTION API CONFIGURATION =====
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

// Debug logging for development
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🌍 Environment:', import.meta.env.MODE);
}

// ===== UTILITY FUNCTIONS =====
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ===== CUSTOM HOOKS =====
const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0)
  
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = scrollPx / winHeightPx
      setScrollProgress(scrolled)
    }
    
    window.addEventListener('scroll', updateScrollProgress)
    return () => window.removeEventListener('scroll', updateScrollProgress)
  }, [])
  
  return scrollProgress
}

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined') return initialValue
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })
  
  const setValue = (value) => {
    try {
      setStoredValue(value)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }
  
  return [storedValue, setValue]
}

// ===== ENHANCED API REQUEST HOOK FOR PRODUCTION =====
const useApiRequest = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const request = useCallback(async (config) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔄 API Request:', config.method, config.url);
      
      const response = await axios({
        ...config,
        baseURL: API_BASE_URL,
        timeout: 180000, // 3 minutes timeout for production scraping
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...config.headers
        },
        withCredentials: false,
        // Add retry logic for network errors
        retry: 3,
        retryDelay: 1000
      })
      
      console.log('✅ API Success:', response.status, response.data?.totalResults || 'No count');
      setLoading(false)
      return response.data
    } catch (err) {
      console.error('❌ API Error:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      
      let errorMessage = 'An unexpected error occurred'
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - Please try with fewer results'
      } else if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found - Please check backend deployment'
      } else if (err.response?.status === 500) {
        errorMessage = err.response?.data?.message || 'Server error - Please try again'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'Network error - Please check your connection and backend status'
      } else {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }, [])
  
  return { request, loading, error }
}

// ===== SCROLL PROGRESS INDICATOR =====
const ScrollProgress = () => {
  const scrollProgress = useScrollProgress()
  
  return (
    <motion.div
      className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary transform origin-left scale-x-0 transition-transform duration-150 ease-out z-50"
      style={{ scaleX: scrollProgress }}
    />
  )
}

// ===== FLOATING ELEMENTS =====
const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-accent-pink/20 to-accent-coral/20 rounded-full blur-xl"
        animate={{
          y: [0, 30, 0],
          x: [0, -15, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-br from-accent-blue/20 to-accent-cyan/20 rounded-full blur-xl"
        animate={{
          y: [0, -25, 0],
          x: [0, 20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <motion.div
        className="absolute top-1/2 right-10 w-24 h-24 bg-gradient-to-br from-accent-green/20 to-accent-mint/20 rounded-full blur-xl"
        animate={{
          y: [0, 20, 0],
          x: [0, -10, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  )
}

// ===== NAVIGATION COMPONENT =====
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const navItems = [
    { id: 'home', label: 'Home', href: '#home' },
    { id: 'features', label: 'Features', href: '#features' },
    { id: 'tools', label: 'Tools', href: '#tools' },
    { id: 'pricing', label: 'Pricing', href: '#pricing' },
    { id: 'about', label: 'About', href: '#about' },
    { id: 'contact', label: 'Contact', href: '#contact' },
  ]
  
  const scrollToSection = (href) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMenuOpen(false)
    }
  }
  
  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "bg-white/10 backdrop-blur-lg border-b border-white/20" : "bg-transparent"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <nav className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <div className="font-bold text-xl">LeadGen</div>
                <div className="text-sm opacity-80">Copilot</div>
              </div>
            </motion.div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.href)}
                  className={cn(
                    "nav-link",
                    activeSection === item.id && "active"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <button className="btn btn-ghost btn-md">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </button>
              <button className="btn btn-primary btn-md">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </motion.header>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
            <motion.div
              className="absolute top-16 left-4 right-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.href)}
                    className="block w-full text-left text-white hover:text-primary transition-colors py-2"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-4 border-t border-white/20 space-y-3">
                  <button className="btn btn-ghost btn-md w-full">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </button>
                  <button className="btn btn-primary btn-md w-full">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ===== HERO SECTION =====
const HeroSection = () => {
  const [currentText, setCurrentText] = useState(0)
  const heroTexts = [
    "Top Lead Generation Platform",
    "Google Maps Business Scraper", 
    "Email Automation Engine",
    "LinkedIn Auto Apply Tool",
    "WhatsApp Number Checker"
  ]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % heroTexts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <section id="home" className="min-h-screen flex flex-col items-center justify-center relative py-20 px-4">
      <FloatingElements />
      
      <div className="container-custom relative z-10 text-center max-w-7xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          className="inline-flex items-center px-6 py-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white/90 text-lg font-medium mb-12 hover:bg-white/20 transition-all cursor-pointer"
          >
          <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
            Generate Unlimited Business Leads
          <ArrowRight className="w-5 h-5 ml-2" />
          </motion.div>
          
          {/* Main Headline */}
        <div className="mb-8">
              <AnimatePresence mode="wait">
            <motion.h1
                  key={currentText}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
                >
              <span className="gradient-text-primary block mb-4">
                  {heroTexts[currentText]}
            </span>
              <span className="block">in the Age of AI</span>
            </motion.h1>
          </AnimatePresence>
        </div>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          className="text-xl lg:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
          Generate unlimited business leads with our AI-powered platform.{" "}
          <span className="gradient-text-secondary font-semibold">
            Proven to boost conversion rates by 54.7%!
          </span>
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20"
          >
          <button 
            className="btn btn-primary btn-xl group min-w-[240px]"
            onClick={() => document.querySelector('#gmaps-scraper')?.scrollIntoView({ behavior: 'smooth' })}
          >
              <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Start Generating Leads
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          <button className="btn btn-secondary btn-xl group min-w-[180px]">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </button>
          </motion.div>
          
        {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto"
          >
            {[
            { icon: MapPin, title: 'Maps Scraper', stats: '10M+', label: 'Leads Generated', color: 'from-emerald-500 to-teal-600', textColor: 'text-emerald-400' },
            { icon: Mail, title: 'Email Finder', stats: '95%', label: 'Accuracy Rate', color: 'from-rose-500 to-pink-600', textColor: 'text-rose-400' },
            { icon: MessageSquare, title: 'Cold Outreach', stats: '54.7%', label: 'Conversion Boost', color: 'from-violet-500 to-purple-600', textColor: 'text-violet-400' },
            { icon: Phone, title: 'WhatsApp Check', stats: '50K+', label: 'Happy Users', color: 'from-blue-500 to-indigo-600', textColor: 'text-blue-400' },
            { icon: Linkedin, title: 'LinkedIn Auto', stats: '1000+', label: 'Daily Apps', color: 'from-orange-500 to-amber-600', textColor: 'text-orange-400' }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="card p-6 text-center group cursor-pointer hover:scale-105 transition-all duration-300"
              whileHover={{ y: -5 }}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl bg-gradient-to-br mx-auto mb-4 p-2.5 group-hover:scale-110 transition-all duration-300",
                item.color
              )}>
                <item.icon className="w-full h-full text-white" />
              </div>
              <div className="text-white text-sm font-medium mb-2">{item.title}</div>
              <div className={cn(
                "text-lg font-bold mb-1",
                item.textColor
              )}>{item.stats}</div>
              <div className="text-xs text-white/60">{item.label}</div>
              <div className="badge badge-new text-xs mt-2">Live</div>
            </motion.div>
          ))}
      </motion.div>
      </div>
    </section>
  )
}

// ===== FEATURE CARDS SECTION =====
const FeaturesSection = () => {
  const features = [
    {
      icon: MapPin,
      title: 'Google Maps Lead Scraper',
      description: 'Extract unlimited business data from Google Maps with our proven double-scroll technology. Get names, addresses, phones, websites, and more.',
      badge: 'Working',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-500/5',
      borderColor: 'border-emerald-500/10',
      textColor: 'text-emerald-900',
      stats: '10M+ businesses',
      link: '#gmaps-scraper'
    },
    {
      icon: Mail,
      title: 'Gmail Email Extractor',
      description: 'Automatically extract and verify email addresses from Gmail with advanced pattern recognition and validation.',
      badge: 'Live',
      color: 'from-rose-500 to-pink-600',
      bgColor: 'bg-rose-500/5',
      borderColor: 'border-rose-500/10',
      textColor: 'text-rose-900',
      stats: '95% accuracy',
      link: '#gmail-extractor'
    },
    {
      icon: Bot,
      title: 'AI Cold Outreach Generator',
      description: 'Generate personalized cold emails and messages using advanced AI. Boost response rates with human-like communication.',
      badge: 'AI Powered',
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-500/5',
      borderColor: 'border-violet-500/10',
      textColor: 'text-violet-900',
      stats: '54.7% boost',
      link: '#cold-outreach'
    },
    {
      icon: Phone,
      title: 'WhatsApp Number Checker',
      description: 'Verify WhatsApp numbers in bulk and check if they\'re active. Perfect for WhatsApp marketing campaigns.',
      badge: 'New',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/5',
      borderColor: 'border-green-500/10',
      textColor: 'text-green-900',
      stats: '99% verification',
      link: '#whatsapp-checker'
    },
    {
      icon: Linkedin,
      title: 'LinkedIn Auto Apply',
      description: 'Automatically apply to LinkedIn jobs with personalized cover letters. Increase your job application efficiency by 10x.',
      badge: 'Beta',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-500/5',
      borderColor: 'border-blue-500/10',
      textColor: 'text-blue-900',
      stats: '1000+ applications/day',
      link: '#linkedin-auto'
    },
    {
      icon: Send,
      title: 'Mass Cold Email Sender',
      description: 'Send thousands of personalized cold emails with advanced scheduling, tracking, and analytics capabilities.',
      badge: 'Pro',
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-orange-500/5',
      borderColor: 'border-orange-500/10',
      textColor: 'text-orange-900',
      stats: '10K+ emails/day',
      link: '#email-sender'
    }
  ]
  
  return (
    <section id="features" className="section bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      <div className="container-custom">
        <InView threshold={0.1} triggerOnce>
          {({ inView, ref }) => (
            <>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="badge badge-primary mb-4">Complete Platform</div>
          <h2 className="heading-responsive font-bold text-gray-900 mb-6">
            Generate Endless Possibilities with One Click
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Through seamlessly integrated AI capabilities, we empower businesses to significantly enhance 
            lead generation efficiency, creativity, and market competitiveness.
          </p>
        </motion.div>
        
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={cn(
                      "relative p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 border",
                      feature.bgColor,
                      feature.borderColor,
                      "hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl"
                    )}
            >
              {/* Badge */}
                    <div className={cn(
                      "absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold",
                      `bg-gradient-to-r ${feature.color} text-white shadow-sm`
                    )}>
                      {feature.badge}
                    </div>
              
              {/* Icon */}
              <div className={cn(
                      "w-12 h-12 rounded-xl mb-4 p-2.5 transition-all duration-300",
                `bg-gradient-to-br ${feature.color}`
              )}>
                      <feature.icon className="w-full h-full text-white" />
              </div>
              
              {/* Content */}
                    <h3 className={cn("text-xl font-bold mb-3", feature.textColor)}>{feature.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{feature.description}</p>
              
                    {/* Stats & CTA */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className={cn(
                        "text-sm font-semibold",
                        `bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`
                      )}>
                        {feature.stats}
                      </div>
                <button 
                  onClick={() => document.querySelector(feature.link)?.scrollIntoView({ behavior: 'smooth' })}
                        className={cn(
                          "inline-flex items-center text-sm font-semibold transition-all",
                          feature.textColor,
                          `hover:text-${feature.color.split('-')[1]}-500`
                        )}
                >
                  Try Now
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
            </>
          )}
        </InView>
      </div>
    </section>
  )
}

// ===== GOOGLE MAPS SCRAPER SECTION =====
const GoogleMapsScraperSection = () => {
  const [query, setQuery] = useState('restaurants in Miami')
  const [maxResults, setMaxResults] = useState(15)
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState([])
  const [stats, setStats] = useState({ processed: 0, successful: 0, failed: 0 })
  const { request, loading, error } = useApiRequest()
  
  const handleScrapeStart = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query')
      return
    }
    
    if (maxResults > 50) {
      toast.error('Please use 50 or fewer results for better performance')
      return
    }
    
    setIsRunning(true)
    setResults([])
    setStats({ processed: 0, successful: 0, failed: 0 })
    
    try {
      toast.loading('Starting Google Maps scraper...', { id: 'scraper' })
      
      console.log('📤 Sending scrape request:', { query, maxResults });
      
      const data = await request({
        method: 'POST',
        url: '/api/scrape-gmaps',
        data: { query, maxResults, mode: 'sequential' }
      })
      
      console.log('📥 Received response:', data);
      
      if (data.success) {
        setResults(data.results || [])
        setStats(data.stats || { processed: 0, successful: 0, failed: 0 })
        toast.success(`Successfully scraped ${(data.results || []).length} businesses!`, { id: 'scraper' })
      } else {
        throw new Error(data.message || 'Scraping failed')
      }
    } catch (error) {
      console.error('🚨 Scraping error:', error);
      toast.error(`Scraping failed: ${error.message}`, { id: 'scraper' })
    } finally {
      setIsRunning(false)
    }
  }
  
  const downloadResults = (format) => {
    if (results.length === 0) {
      toast.error('No results to download')
      return
    }
    
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
      const filename = `gmaps_results_${timestamp}.${format}`
      const data = format === 'json' ? JSON.stringify(results, null, 2) : convertToCSV(results)
      const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Downloaded ${filename}`)
    } catch (error) {
      toast.error('Failed to download results')
    }
  }
  
  const convertToCSV = (data) => {
    const headers = ['Name', 'Category', 'Phone', 'Website', 'Address', 'Rating', 'Reviews', 'Hours', 'Price Level', 'Google Maps URL', 'Latitude', 'Longitude', 'Extracted At']
    const rows = data.map(item => [
      item.name || '', 
      item.category || '', 
      item.phone || '',
      item.website || '', 
      item.address || '', 
      item.rating || '', 
      item.reviewCount || '',
      item.hours || '',
      item.priceLevel || '',
      item.googleMapsUrl || '',
      item.coordinates?.lat || '',
      item.coordinates?.lng || '',
      item.extractedAt || ''
    ])
    return [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n')
  }
  
  return (
    <section id="gmaps-scraper" className="section">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="badge badge-success mb-4">🗺️ Live Production API</div>
          <h2 className="heading-responsive font-bold text-white mb-6">
            Google Maps Business Scraper
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Extract unlimited business data with our proven double-scroll technology. 
            Get names, phones, websites, addresses, and more from Google Maps.
          </p>
          
          {/* API Status Indicator */}
          <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              <span className="text-white/80 text-sm">
                API: {API_BASE_URL.replace('https://', '').replace('http://', '')}
              </span>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-lg">
              <Server className="w-4 h-4 mr-2 text-blue-400" />
              <span className="text-white/80 text-sm">
                {import.meta.env.MODE === 'development' ? 'Development' : 'Production'}
              </span>
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Scraper Controls */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              <MapPin className="w-6 h-6 inline mr-2" />
              Scraper Configuration
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white/80 mb-2">Search Query</label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., restaurants in Miami"
                  className="form-input"
                  disabled={isRunning}
                />
                <p className="text-white/60 text-sm mt-1">
                  Try: "hotels in NYC", "dentists in Chicago", "gyms in Austin"
                </p>
              </div>
              
              <div>
                <label className="block text-white/80 mb-2">Max Results</label>
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  className="form-select"
                  disabled={isRunning}
                >
                  <option value={5}>5 Results (Fast)</option>
                  <option value={10}>10 Results (Recommended)</option>
                  <option value={15}>15 Results (Good)</option>
                  <option value={25}>25 Results (Slower)</option>
                  <option value={50}>50 Results (Slowest)</option>
                </select>
                <p className="text-white/60 text-sm mt-1">
                  Recommended: 10-15 for best performance on free tier
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleScrapeStart}
                  disabled={isRunning || loading}
                  className="btn btn-primary flex-1"
                >
                  {isRunning || loading ? (
                    <>
                      <div className="loading-spinner w-4 h-4 mr-2" />
                      Scraping...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Start Scraping
                    </>
                  )}
                </button>
              </div>
              
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">
                    <span className="font-semibold">Error:</span> {error}
                  </p>
                  <p className="text-red-300 text-xs mt-2">
                    💡 Try: Reduce max results, check internet connection, or try a different query
                  </p>
                </div>
              )}
              
              {results.length > 0 && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => downloadResults('json')}
                      className="btn btn-secondary flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      JSON
                    </button>
                    <button
                      onClick={() => downloadResults('csv')}
                      className="btn btn-secondary flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-white/70 text-sm">
                      ✅ {results.length} businesses ready for download
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Stats */}
            {(stats.processed > 0 || isRunning) && (
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-semibold mb-3">Live Stats</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{stats.processed || 0}</div>
                    <div className="text-xs text-white/60">Processed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{stats.successful || 0}</div>
                    <div className="text-xs text-white/60">Successful</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">{stats.failed || 0}</div>
                    <div className="text-xs text-white/60">Failed</div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
          
          {/* Results Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              <Database className="w-6 h-6 inline mr-2" />
              Results Preview
            </h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
              {results.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No results yet. Start scraping to see business data here.</p>
                  <p className="text-sm">Our scraper extracts:</p>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div>• Business Name</div>
                    <div>• Phone Number</div>
                    <div>• Address</div>
                    <div>• Website</div>
                    <div>• Rating & Reviews</div>
                    <div>• Coordinates</div>
                  </div>
                </div>
              ) : (
                results.slice(0, 5).map((business, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white truncate pr-2" title={business.name}>
                        {business.name}
                      </h4>
                      <div className="badge badge-success">#{index + 1}</div>
                    </div>
                    <div className="space-y-1 text-sm text-white/80">
                      {business.address && business.address !== 'Not Found' && (
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span className="truncate" title={business.address}>{business.address}</span>
                        </div>
                      )}
                      {business.phone && business.phone !== 'Not Found' && (
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span>{business.phone}</span>
                        </div>
                      )}
                      {business.website && business.website !== 'Not Found' && business.website !== 'undefined' && (
                        <div className="flex items-center">
                          <Globe className="w-3 h-3 mr-2 flex-shrink-0" />
                          <a 
                            href={business.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 truncate"
                            title={business.website}
                          >
                            Website
                          </a>
                        </div>
                      )}
                      {business.rating && business.rating !== 'Not Found' && (
                        <div className="flex items-center">
                          <Star className="w-3 h-3 mr-2 text-yellow-400 flex-shrink-0" />
                          <span>{business.rating} stars</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              
              {results.length > 5 && (
                <div className="text-center py-4">
                  <div className="text-white/60">+ {results.length - 5} more results</div>
                  <button 
                    onClick={() => downloadResults('json')}
                    className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                  >
                    Download all results →
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ===== OTHER TOOL SECTIONS =====
const ToolSection = ({ id, icon: Icon, title, description, badge, features, comingSoon = false }) => {
  return (
    <section id={id} className="section">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className={cn(
            "badge mb-4",
            comingSoon ? "badge-coming-soon" : "badge-primary"
          )}>
            {badge}
          </div>
          <h2 className="heading-responsive font-bold text-white mb-6">
            <Icon className="w-8 h-8 inline mr-3" />
            {title}
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">{description}</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Feature List */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
          
          {/* Interface Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card p-8 relative"
          >
            {comingSoon && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                <div className="text-center">
                  <Clock className="w-12 h-12 text-white mx-auto mb-4" />
                  <div className="text-xl font-bold text-white mb-2">Coming Soon</div>
                  <div className="text-white/70">This feature is under development</div>
                </div>
              </div>
            )}
            
            <div className="text-center py-12">
              <Icon className="w-24 h-24 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Interactive Demo</h3>
              <p className="text-white/70 mb-6">
                {comingSoon ? 'Preview will be available soon' : 'Click to try the live demo'}
              </p>
              <button 
                className={cn(
                  "btn btn-primary",
                  comingSoon && "opacity-50 cursor-not-allowed"
                )}
                disabled={comingSoon}
              >
                {comingSoon ? 'Coming Soon' : 'Try Now'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ===== PRICING SECTION =====
const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState('monthly')
  
  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      features: [
        '100 Google Maps leads/month',
        '50 email verifications/month',
        'Basic cold outreach templates',
        'CSV/JSON export',
        'Email support'
      ],
      badge: null,
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Pro',
      price: { monthly: 29, yearly: 290 },
      description: 'Best for growing businesses',
      features: [
        '10,000 Google Maps leads/month',
        '5,000 email verifications/month',
        'AI-powered cold outreach',
        'WhatsApp number checking',
        'LinkedIn auto apply (500/day)',
        'Priority support',
        'Advanced analytics'
      ],
      badge: 'Most Popular',
      cta: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: { monthly: 99, yearly: 990 },
      description: 'For teams and agencies',
      features: [
        'Unlimited Google Maps leads',
        'Unlimited email verifications',
        'Custom AI outreach models',
        'White-label solution',
        'Team collaboration',
        'API access',
        'Dedicated support',
        'Custom integrations'
      ],
      badge: 'Coming Soon',
      cta: 'Contact Sales',
      popular: false
    }
  ]
  
  return (
    <section id="pricing" className="section bg-gradient-to-br from-gray-50 to-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="badge badge-primary mb-4">Simple Pricing</div>
          <h2 className="heading-responsive font-bold text-gray-900 mb-6">
            Choose Your Lead Generation Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-4 py-2 rounded-md font-medium transition-all",
                billingCycle === 'monthly' ? "bg-white shadow-sm text-gray-900" : "text-gray-600"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                "px-4 py-2 rounded-md font-medium transition-all",
                billingCycle === 'yearly' ? "bg-white shadow-sm text-gray-900" : "text-gray-600"
              )}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={cn(
                "pricing-card",
                plan.popular && "featured"
              )}
            >
              {plan.badge && (
                <div className={cn(
                  "badge mb-4",
                  plan.badge === 'Most Popular' ? "badge-primary" : "badge-coming-soon"
                )}>
                  {plan.badge}
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price[billingCycle]}
                  </span>
                  <span className="text-gray-600 ml-2">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                  <div className="text-sm text-green-600 mt-1">
                    Save ${(plan.price.monthly * 12) - plan.price.yearly} per year
                  </div>
                )}
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                className={cn(
                  "btn w-full",
                  plan.popular ? "btn-primary" : "btn-outline",
                  plan.name === 'Enterprise' && "opacity-50 cursor-not-allowed"
                )}
                disabled={plan.name === 'Enterprise'}
              >
                {plan.cta}
                {plan.name !== 'Enterprise' && <ArrowRight className="w-4 h-4 ml-2" />}
              </button>
            </motion.div>
          ))}
        </div>
        
        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            {[
              {
                q: "Can I change plans anytime?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                q: "Is there a free trial?",
                a: "Yes, our Free plan gives you access to core features. Pro plans come with a 7-day free trial."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and wire transfers for Enterprise plans."
              },
              {
                q: "Can I cancel anytime?",
                a: "Absolutely. Cancel anytime with no questions asked. No hidden fees or penalties."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ===== FOOTER =====
const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  const footerLinks = {
    'Product': [
      { label: 'Google Maps Scraper', href: '#gmaps-scraper' },
      { label: 'Email Extractor', href: '#gmail-extractor' },
      { label: 'Cold Outreach', href: '#cold-outreach' },
      { label: 'WhatsApp Checker', href: '#whatsapp-checker' },
      { label: 'LinkedIn Auto Apply', href: '#linkedin-auto' },
      { label: 'Pricing', href: '#pricing' }
    ],
    'Company': [
      { label: 'About Us', href: '#about' },
      { label: 'Contact', href: '#contact' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' }
    ],
    'Resources': [
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/api' },
      { label: 'Help Center', href: '/help' },
      { label: 'Community', href: '/community' },
      { label: 'Status', href: '/status' }
    ],
    'Legal': [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'GDPR', href: '/gdpr' }
    ]
  }
  
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-xl">LeadGen Copilot</div>
                <div className="text-sm opacity-80">AI-Powered Lead Generation</div>
              </div>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              Generate unlimited business leads with our AI-powered platform. 
              Trusted by 50,000+ users worldwide.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Twitter, href: 'https://twitter.com' },
                { icon: Facebook, href: 'https://facebook.com' },
                { icon: Linkedin, href: 'https://linkedin.com' },
                { icon: Github, href: 'https://github.com' }
              ].map(({ icon: Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom */}
        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="text-white/70 mb-4 md:mb-0">
            © {currentYear} LeadGen Copilot. All rights reserved.
          </div>
          <div className="flex items-center space-x-4 text-sm text-white/70">
            <span>Made with ❤️ for lead generation</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ===== MAIN APP COMPONENT =====
const App = () => {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    // Ensure we're in a browser environment
    if (typeof window !== 'undefined') {
      setMounted(true)
    
      // Set up smooth scrolling for anchor links
      const handleAnchorClick = (e) => {
        const href = e.target.getAttribute('href')
        if (href?.startsWith('#')) {
          e.preventDefault()
          const element = document.querySelector(href)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        }
      }
    
      document.addEventListener('click', handleAnchorClick)
      return () => document.removeEventListener('click', handleAnchorClick)
    }
  }, [])
  
  // Show loading state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="loading-spinner w-12 h-12" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <ScrollProgress />
      <Navigation />
      
      <main>
        <HeroSection />
        <FeaturesSection />
        <GoogleMapsScraperSection />
        
        {/* Other Tool Sections */}
        <ToolSection
          id="gmail-extractor"
          icon={Mail}
          title="Gmail Email Extractor"
          description="Extract and verify email addresses from Gmail with advanced pattern recognition"
          badge="🔥 Coming Soon"
          comingSoon={true}
          features={[
            { title: 'Pattern Recognition', description: 'Advanced AI to find email patterns in Gmail' },
            { title: 'Bulk Verification', description: 'Verify thousands of emails in minutes' },
            { title: 'Export Options', description: 'CSV, JSON, and direct CRM integration' },
            { title: 'Privacy Compliant', description: 'GDPR and privacy regulation compliant' }
          ]}
        />
        
        <ToolSection
          id="cold-outreach"
          icon={Bot}
          title="AI Cold Outreach Generator"
          description="Generate personalized cold emails with AI to boost response rates"
          badge="🤖 AI Powered"
          comingSoon={true}
          features={[
            { title: 'AI Personalization', description: 'Generate unique messages for each prospect' },
            { title: 'A/B Testing', description: 'Test different approaches automatically' },
            { title: 'Response Tracking', description: 'Track opens, clicks, and responses' },
            { title: 'Template Library', description: '1000+ proven templates across industries' }
          ]}
        />
        
        <ToolSection
          id="whatsapp-checker"
          icon={Phone}
          title="WhatsApp Number Checker"
          description="Verify WhatsApp numbers in bulk for marketing campaigns"
          badge="📱 New Feature"
          comingSoon={true}
          features={[
            { title: 'Bulk Verification', description: 'Check thousands of numbers at once' },
            { title: 'Active Status', description: 'See if numbers are active on WhatsApp' },
            { title: 'Profile Info', description: 'Get profile pictures and status info' },
            { title: 'Export Results', description: 'Clean lists ready for marketing' }
          ]}
        />
        
        <ToolSection
          id="linkedin-auto"
          icon={Linkedin}
          title="LinkedIn Auto Apply"
          description="Automatically apply to LinkedIn jobs with personalized cover letters"
          badge="💼 Beta"
          comingSoon={true}
          features={[
            { title: 'Auto Application', description: 'Apply to jobs automatically 24/7' },
            { title: 'Custom Cover Letters', description: 'AI-generated personalized letters' },
            { title: 'Job Filtering', description: 'Advanced filters for relevant positions' },
            { title: 'Application Tracking', description: 'Track all applications and responses' }
          ]}
        />
        
        <ToolSection
          id="email-sender"
          icon={Send}
          title="Mass Cold Email Sender"
          description="Send thousands of personalized emails with advanced tracking"
          badge="📧 Pro Feature"
          comingSoon={true}
          features={[
            { title: 'Mass Sending', description: 'Send up to 10,000 emails per day' },
            { title: 'Smart Scheduling', description: 'Optimal timing for each recipient' },
            { title: 'Deliverability', description: 'High inbox rates with warm-up' },
            { title: 'Analytics', description: 'Detailed campaign performance metrics' }
          ]}
        />
        
        <PricingSection />
      </main>
      
      <Footer />
    </div>
  )
}

export default App