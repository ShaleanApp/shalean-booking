"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBooking } from '@/contexts/BookingContext'
import { ServiceCategory, ServiceItem, ServiceExtra } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Plus, Minus, Check } from 'lucide-react'

export function ServiceSelectionStep() {
  const { state, updateFormData } = useBooking()
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [extras, setExtras] = useState<ServiceExtra[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if environment variables are set
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error('Supabase environment variables are not configured. Please check your .env.local file.')
        }

        const supabase = createClient()
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('service_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order')

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError)
          throw new Error(`Failed to fetch categories: ${categoriesError.message}`)
        }

        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('service_items')
          .select('*')
          .eq('is_active', true)
          .order('created_at')

        if (servicesError) {
          console.error('Error fetching services:', servicesError)
          throw new Error(`Failed to fetch services: ${servicesError.message}`)
        }

        // Fetch extras
        const { data: extrasData, error: extrasError } = await supabase
          .from('service_extras')
          .select('*')
          .eq('is_active', true)
          .order('created_at')

        if (extrasError) {
          console.error('Error fetching extras:', extrasError)
          throw new Error(`Failed to fetch extras: ${extrasError.message}`)
        }

        setCategories(categoriesData || [])
        setServices(servicesData || [])
        setExtras(extrasData || [])
        
        if (categoriesData && categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id)
        }
      } catch (error) {
        console.error('Error fetching services:', error)
        // Set empty arrays to prevent further errors
        setCategories([])
        setServices([])
        setExtras([])
        setError(error instanceof Error ? error.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Services</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="text-sm text-muted-foreground">
            <p>Please check that:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Your .env.local file exists and contains the correct Supabase credentials</li>
              <li>Supabase is running (local or remote)</li>
              <li>Your internet connection is working</li>
            </ul>
          </div>
        </div>
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
                            ₦{(service.base_price / 100).toFixed(2)}
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
                            +₦{(extra.price / 100).toFixed(2)}
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
                      ₦{((service.base_price / 100) * serviceData.quantity).toFixed(2)}
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
                      ₦{((extra.price / 100) * extraData.quantity).toFixed(2)}
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
