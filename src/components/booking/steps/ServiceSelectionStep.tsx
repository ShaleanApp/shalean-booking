'use client'

"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBooking } from '@/contexts/BookingContext'
import { ServiceCategory, ServiceItem, ServiceExtra } from '@/types'
import { createSupabaseBrowser } from '@/lib/supabase/browser'
import { Plus, Minus, Check } from 'lucide-react'
import { formatServicePrice, formatExtraPrice, formatTotalAmount } from '@/lib/currency'
import { LoadingState, RetryButton } from '@/components/shared/LoadingState'
import { useToast } from '@/components/shared/Toast'
import { safeApiCall, createErrorHandler } from '@/lib/error-handling'
import { cachedApiCall, CACHE_KEYS, invalidateServiceCache } from '@/lib/cache'

export function ServiceSelectionStep() {
  const { state, updateFormData } = useBooking()
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [extras, setExtras] = useState<ServiceExtra[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)
  
  const toast = useToast()
  const errorHandler = createErrorHandler()

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Environment variables are validated at import time in env.client.ts

      const supabase = createSupabaseBrowser()
      
      // Fetch categories with caching
      const categoriesData = await cachedApiCall(
        CACHE_KEYS.SERVICE_CATEGORIES,
        async () => {
          const result = await safeApiCall(async () => {
            const { data, error } = await supabase
              .from('service_categories')
              .select('*')
              .eq('is_active', true)
              .order('sort_order')
            
            if (error) throw error
            return data
          })

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to fetch categories')
          }

          return result.data
        },
        { ttl: 10 * 60 * 1000 } // Cache for 10 minutes
      )

      // Fetch services with caching
      const servicesData = await cachedApiCall(
        CACHE_KEYS.SERVICE_ITEMS(),
        async () => {
          const result = await safeApiCall(async () => {
            const { data, error } = await supabase
              .from('service_items')
              .select('*')
              .eq('is_active', true)
              .order('created_at')

            if (error) throw error
            return data
          })

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to fetch services')
          }

          return result.data
        },
        { ttl: 10 * 60 * 1000 } // Cache for 10 minutes
      )

      // Fetch extras with caching
      const extrasData = await cachedApiCall(
        CACHE_KEYS.SERVICE_EXTRAS,
        async () => {
          const result = await safeApiCall(async () => {
            const { data, error } = await supabase
              .from('service_extras')
              .select('*')
              .eq('is_active', true)
              .order('created_at')
            
            if (error) throw error
            return data
          })

          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to fetch extras')
          }

          return result.data
        },
        { ttl: 10 * 60 * 1000 } // Cache for 10 minutes
      )

      setCategories(categoriesData || [])
      setServices(servicesData || [])
      setExtras(extrasData || [])
      
      if (categoriesData && categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0].id)
      }

      toast.success('Services loaded successfully')
    } catch (error) {
      const errorMessage = errorHandler.handleError(error, 'Service Selection')
      setError(errorMessage)
      toast.error('Failed to load services', errorMessage)
    } finally {
      setLoading(false)
      setRetrying(false)
    }
  }

  const handleRetry = async () => {
    setRetrying(true)
    await fetchData()
  }

  const filteredServices = selectedCategory 
    ? services.filter(service => service.category_id === selectedCategory)
    : services

  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    const currentServices = state.formData.services
    const existingIndex = currentServices.findIndex(s => s.service_item_id === serviceId)
    
    let newServices
    if (quantity === 0) {
      newServices = currentServices.filter(s => s.service_item_id !== serviceId)
    } else if (existingIndex >= 0) {
      newServices = [...currentServices]
      newServices[existingIndex] = { service_item_id: serviceId, quantity }
    } else {
      newServices = [...currentServices, { service_item_id: serviceId, quantity }]
    }
    
    updateFormData({ services: newServices })
  }

  const updateExtraQuantity = (extraId: string, quantity: number) => {
    const currentExtras = state.formData.extras
    const existingIndex = currentExtras.findIndex(e => e.service_extra_id === extraId)
    
    let newExtras
    if (quantity === 0) {
      newExtras = currentExtras.filter(e => e.service_extra_id !== extraId)
    } else if (existingIndex >= 0) {
      newExtras = [...currentExtras]
      newExtras[existingIndex] = { service_extra_id: extraId, quantity }
    } else {
      newExtras = [...currentExtras, { service_extra_id: extraId, quantity }]
    }
    
    updateFormData({ extras: newExtras })
  }

  const getServiceQuantity = (serviceId: string) => {
    const service = state.formData.services.find(s => s.service_item_id === serviceId)
    return service?.quantity || 0
  }

  const getExtraQuantity = (extraId: string) => {
    const extra = state.formData.extras.find(e => e.service_extra_id === extraId)
    return extra?.quantity || 0
  }

  if (loading) {
    return (
      <LoadingState 
        message="Loading services..." 
        variant="card"
        className="h-64"
      />
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <RetryButton 
          onRetry={handleRetry}
          loading={retrying}
          error={error}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Service Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card
              key={category.id}
              className={`cursor-pointer transition-colors ${
                selectedCategory === category.id
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{category.name}</CardTitle>
                {category.description && (
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Services Selection */}
      {selectedCategory && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Available Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map((service) => {
              const quantity = getServiceQuantity(service.id)
              return (
                <Card key={service.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-base">{service.name}</CardTitle>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {service.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            {formatServicePrice(service.base_price)}
                          </Badge>
                          <Badge variant="outline">
                            {(service as any).unit || 'item'}
                          </Badge>
                        </div>
                      </div>
                      {quantity > 0 && (
                        <div className="flex items-center gap-1 text-primary">
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-medium">{quantity}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Quantity
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateServiceQuantity(service.id, Math.max(0, quantity - 1))}
                          disabled={quantity === 0}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateServiceQuantity(service.id, quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Extras Selection */}
      {extras.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Additional Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {extras.map((extra) => {
              const quantity = getExtraQuantity(extra.id)
              return (
                <Card key={extra.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-base">{extra.name}</CardTitle>
                        {extra.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {extra.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            {formatExtraPrice(extra.price)}
                          </Badge>
                        </div>
                      </div>
                      {quantity > 0 && (
                        <div className="flex items-center gap-1 text-primary">
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-medium">{quantity}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Quantity
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateExtraQuantity(extra.id, Math.max(0, quantity - 1))}
                          disabled={quantity === 0}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateExtraQuantity(extra.id, quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {state.formData.services.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Selected Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {state.formData.services.map((serviceData) => {
                const service = services.find(s => s.id === serviceData.service_item_id)
                if (!service) return null
                return (
                  <div key={serviceData.service_item_id} className="flex justify-between items-center">
                    <span className="text-sm">{service.name} x{serviceData.quantity}</span>
                    <span className="text-sm font-medium">
                      {formatTotalAmount(service.base_price * serviceData.quantity)}
                    </span>
                  </div>
                )
              })}
              {state.formData.extras.map((extraData) => {
                const extra = extras.find(e => e.id === extraData.service_extra_id)
                if (!extra) return null
                return (
                  <div key={extraData.service_extra_id} className="flex justify-between items-center">
                    <span className="text-sm">{extra.name} x{extraData.quantity}</span>
                    <span className="text-sm font-medium">
                      {formatTotalAmount(extra.price * extraData.quantity)}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
