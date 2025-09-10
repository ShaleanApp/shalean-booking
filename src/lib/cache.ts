/**
 * Client-side caching utilities for API responses
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of entries
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize: number

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }
}

// Global cache instance
const globalCache = new MemoryCache({
  ttl: 5 * 60 * 1000, // 5 minutes default
  maxSize: 100
})

/**
 * Cache key generators
 */
export const CACHE_KEYS = {
  SERVICE_CATEGORIES: 'service_categories',
  SERVICE_ITEMS: (categoryId?: string) => 
    categoryId ? `service_items_${categoryId}` : 'service_items_all',
  SERVICE_EXTRAS: 'service_extras',
  USER_PROFILE: (userId: string) => `user_profile_${userId}`,
  USER_ADDRESSES: (userId: string) => `user_addresses_${userId}`,
  BOOKING_HISTORY: (userId: string) => `booking_history_${userId}`,
  PAYMENT_HISTORY: (userId: string) => `payment_history_${userId}`,
} as const

/**
 * Cached API call wrapper
 */
export async function cachedApiCall<T>(
  key: string,
  apiCall: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Check cache first
  const cached = globalCache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Make API call
  const data = await apiCall()
  
  // Cache the result
  globalCache.set(key, data, options.ttl)
  
  return data
}

/**
 * Cache invalidation helpers
 */
export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    globalCache.clear()
    return
  }

  const keys = globalCache.keys()
  keys.forEach(key => {
    if (key.includes(pattern)) {
      globalCache.delete(key)
    }
  })
}

export function invalidateUserCache(userId: string): void {
  invalidateCache(userId)
}

export function invalidateServiceCache(): void {
  invalidateCache('service_')
}

/**
 * Cache statistics
 */
export function getCacheStats() {
  return {
    size: globalCache.size(),
    keys: globalCache.keys(),
  }
}

/**
 * React hook for cached API calls
 */
export function useCachedApiCall<T>(
  key: string,
  apiCall: () => Promise<T>,
  options: CacheOptions = {}
) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const result = await cachedApiCall(key, apiCall, options)
        
        if (isMounted) {
          setData(result)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [key, apiCall, options.ttl])

  return { data, loading, error }
}

// Import React for the hook
import React from 'react'

// Export the cache instance for direct access if needed
export { globalCache as cache }

