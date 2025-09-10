/**
 * Performance monitoring utilities
 */

import React from 'react'

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  type: 'navigation' | 'paint' | 'largest-contentful-paint' | 'first-input' | 'cumulative-layout-shift' | 'custom'
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []

  constructor() {
    this.initializeObservers()
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return

    // Core Web Vitals observer
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: entry.name,
              value: entry.startTime,
              timestamp: Date.now(),
              type: entry.entryType as PerformanceMetric['type']
            })
          }
        })

        observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] })
        this.observers.push(observer)
      } catch (error) {
        console.warn('Performance monitoring not supported:', error)
      }
    }
  }

  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric: ${metric.name} = ${metric.value}ms`)
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric)
    }
  }

  private sendToAnalytics(_metric: PerformanceMetric) {
    // TODO: Send to analytics service (e.g., Google Analytics, Mixpanel)
    // Example:
    // gtag('event', 'performance_metric', {
    //   metric_name: metric.name,
    //   metric_value: metric.value,
    //   metric_type: metric.type
    // })
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  getCoreWebVitals() {
    const vitals = {
      LCP: 0, // Largest Contentful Paint
      FID: 0, // First Input Delay
      CLS: 0, // Cumulative Layout Shift
      FCP: 0, // First Contentful Paint
      TTFB: 0, // Time to First Byte
    }

    this.metrics.forEach(metric => {
      switch (metric.name) {
        case 'largest-contentful-paint':
          vitals.LCP = metric.value
          break
        case 'first-input':
          vitals.FID = metric.value
          break
        case 'layout-shift':
          vitals.CLS += metric.value
          break
        case 'first-contentful-paint':
          vitals.FCP = metric.value
          break
        case 'navigation':
          vitals.TTFB = metric.value
          break
      }
    })

    return vitals
  }

  getPerformanceScore() {
    const vitals = this.getCoreWebVitals()
    
    // Simple scoring based on Core Web Vitals thresholds
    let score = 100
    
    // LCP: Good < 2.5s, Needs Improvement < 4s, Poor >= 4s
    if (vitals.LCP > 4000) score -= 30
    else if (vitals.LCP > 2500) score -= 15
    
    // FID: Good < 100ms, Needs Improvement < 300ms, Poor >= 300ms
    if (vitals.FID > 300) score -= 30
    else if (vitals.FID > 100) score -= 15
    
    // CLS: Good < 0.1, Needs Improvement < 0.25, Poor >= 0.25
    if (vitals.CLS > 0.25) score -= 30
    else if (vitals.CLS > 0.1) score -= 15
    
    return Math.max(0, score)
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * Measure function execution time
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now()
  
  const result = fn()
  
  if (result instanceof Promise) {
    return result.then((value) => {
      const end = performance.now()
      performanceMonitor.recordMetric({
        name,
        value: end - start,
        timestamp: Date.now(),
        type: 'custom'
      })
      return value
    })
  } else {
    const end = performance.now()
    performanceMonitor.recordMetric({
      name,
      value: end - start,
      timestamp: Date.now(),
      type: 'custom'
    })
    return result
  }
}

/**
 * Measure API call performance
 */
export async function measureApiCall<T>(
  endpoint: string,
  apiCall: () => Promise<T>
): Promise<T> {
  return measurePerformance(`api_${endpoint}`, apiCall)
}

/**
 * Measure component render time
 */
export function measureComponentRender(
  componentName: string,
  renderFn: () => void
) {
  return measurePerformance(`render_${componentName}`, renderFn)
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = React.useState<PerformanceMetric[]>([])
  const [score, setScore] = React.useState(0)

  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics())
      setScore(performanceMonitor.getPerformanceScore())
    }

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000)
    updateMetrics() // Initial update

    return () => clearInterval(interval)
  }, [])

  return {
    metrics,
    score,
    coreWebVitals: performanceMonitor.getCoreWebVitals(),
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor)
  }
}

/**
 * Performance report component
 */
export function PerformanceReport() {
  const { metrics, score, coreWebVitals } = usePerformanceMonitor()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return React.createElement('div', {
    className: 'fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm'
  }, [
    React.createElement('h3', { key: 'title', className: 'font-bold mb-2' }, 'Performance Report'),
    React.createElement('div', { key: 'metrics', className: 'space-y-1' }, [
      React.createElement('div', { key: 'score' }, `Score: ${score}/100`),
      React.createElement('div', { key: 'lcp' }, `LCP: ${coreWebVitals.LCP.toFixed(0)}ms`),
      React.createElement('div', { key: 'fid' }, `FID: ${coreWebVitals.FID.toFixed(0)}ms`),
      React.createElement('div', { key: 'cls' }, `CLS: ${coreWebVitals.CLS.toFixed(3)}`),
      React.createElement('div', { key: 'fcp' }, `FCP: ${coreWebVitals.FCP.toFixed(0)}ms`),
      React.createElement('div', { key: 'ttfb' }, `TTFB: ${coreWebVitals.TTFB.toFixed(0)}ms`)
    ]),
    React.createElement('div', { key: 'count', className: 'mt-2 text-xs text-gray-300' }, `Metrics: ${metrics.length}`)
  ])
}

