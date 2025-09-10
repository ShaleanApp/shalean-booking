'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, DollarSign, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { formatServicePrice } from '@/lib/currency'

interface ServiceCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  is_active: boolean
  sort_order: number
}

interface ServiceItem {
  id: string
  name: string
  description: string | null
  base_price: number
  duration_minutes: number
  is_active: boolean
  sort_order: number
  category: ServiceCategory
}

interface ServiceBrowserProps {
  showAll?: boolean
  maxItems?: number
}

export function ServiceBrowser({ showAll = false, maxItems = 8 }: ServiceBrowserProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [items, setItems] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/public/services/categories?active_only=true')
        const categoriesData = await categoriesResponse.json()
        
        if (!categoriesResponse.ok) {
          throw new Error(categoriesData.error || 'Failed to fetch categories')
        }
        
        setCategories(categoriesData.categories || [])
        
        // Fetch items
        const itemsResponse = await fetch('/api/public/services/items?active_only=true')
        const itemsData = await itemsResponse.json()
        
        if (!itemsResponse.ok) {
          throw new Error(itemsData.error || 'Failed to fetch items')
        }
        
        setItems(itemsData.items || [])
      } catch (err) {
        console.error('Error fetching services:', err)
        setError(err instanceof Error ? err.message : 'Failed to load services')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredItems = selectedCategory 
    ? items.filter(item => item.category.id === selectedCategory)
    : items

  const displayItems = showAll ? filteredItems : filteredItems.slice(0, maxItems)

  const formatPrice = (price: number) => {
    return formatServicePrice(price)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Failed to load services: {error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            size="sm"
          >
            All Services
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              size="sm"
            >
              {category.icon && <span className="mr-2">{category.icon}</span>}
              {category.name}
            </Button>
          ))}
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {item.category.name}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="ml-2">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {item.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span className="font-semibold">{formatPrice(item.base_price)}</span>
                </div>
                <div className="flex items-center text-blue-600 dark:text-blue-400">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{formatDuration(item.duration_minutes)}</span>
                </div>
              </div>

              <Button asChild className="w-full">
                <Link href="/book">
                  Book Now
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Show More Button */}
      {!showAll && filteredItems.length > maxItems && (
        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/services">
              View All Services
            </Link>
          </Button>
        </div>
      )}

      {displayItems.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No services found for the selected category.
          </p>
        </div>
      )}
    </div>
  )
}

