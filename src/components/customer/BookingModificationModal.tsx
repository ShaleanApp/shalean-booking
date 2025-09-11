'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/browser'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign,
  Plus,
  Minus,
  Save,
  X
} from 'lucide-react'
import { BookingWithDetails, ServiceItem, ServiceExtra, Address } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'

const modificationSchema = z.object({
  service_date: z.string().min(1, 'Service date is required'),
  service_time: z.string().min(1, 'Service time is required'),
  notes: z.string().optional(),
  address_id: z.string().optional()
})

type ModificationFormData = z.infer<typeof modificationSchema>

interface BookingModificationModalProps {
  booking: BookingWithDetails
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function BookingModificationModal({ 
  booking, 
  isOpen, 
  onClose, 
  onSuccess 
}: BookingModificationModalProps) {
  const [activeTab, setActiveTab] = useState('schedule')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([])
  const [serviceExtras, setServiceExtras] = useState<ServiceExtra[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedServices, setSelectedServices] = useState<{[key: string]: number}>({})
  const [selectedExtras, setSelectedExtras] = useState<{[key: string]: number}>({})
  const [totalAmount, setTotalAmount] = useState(0)
  const supabase = createSupabaseBrowser()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ModificationFormData>({
    resolver: zodResolver(modificationSchema),
    defaultValues: {
      service_date: booking.service_date,
      service_time: booking.service_time,
      notes: booking.notes || '',
      address_id: booking.address?.id
    }
  })

  const selectedAddressId = watch('address_id')

  useEffect(() => {
    if (isOpen) {
      fetchData()
      initializeSelections()
    }
  }, [isOpen])

  useEffect(() => {
    calculateTotal()
  }, [selectedServices, selectedExtras])

  const fetchData = async () => {
    try {
      // Fetch service items
      const { data: items } = await supabase
        .from('service_items')
        .select('*')
        .eq('is_active', true)
        .order('name')

      // Fetch service extras
      const { data: extras } = await supabase
        .from('service_extras')
        .select('*')
        .eq('is_active', true)
        .order('name')

      // Fetch addresses
      const { data: addrs } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', booking.customer_id)
        .order('is_default', { ascending: false })

      setServiceItems(items || [])
      setServiceExtras(extras || [])
      setAddresses(addrs || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const initializeSelections = () => {
    const services: {[key: string]: number} = {}
    const extras: {[key: string]: number} = {}

    booking.services?.forEach(service => {
      if (service.service_item?.id) {
        services[service.service_item.id] = service.quantity
      }
    })

    booking.extras?.forEach(extra => {
      if (extra.service_extra?.id) {
        extras[extra.service_extra.id] = extra.quantity
      }
    })

    setSelectedServices(services)
    setSelectedExtras(extras)
  }

  const calculateTotal = () => {
    let total = 0

    Object.entries(selectedServices).forEach(([itemId, quantity]) => {
      const item = serviceItems.find(i => i.id === itemId)
      if (item) {
        total += item.base_price * quantity
      }
    })

    Object.entries(selectedExtras).forEach(([extraId, quantity]) => {
      const extra = serviceExtras.find(e => e.id === extraId)
      if (extra) {
        total += extra.price * quantity
      }
    })

    setTotalAmount(total)
  }

  const updateServiceQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      const newServices = { ...selectedServices }
      delete newServices[itemId]
      setSelectedServices(newServices)
    } else {
      setSelectedServices(prev => ({ ...prev, [itemId]: quantity }))
    }
  }

  const updateExtraQuantity = (extraId: string, quantity: number) => {
    if (quantity <= 0) {
      const newExtras = { ...selectedExtras }
      delete newExtras[extraId]
      setSelectedExtras(newExtras)
    } else {
      setSelectedExtras(prev => ({ ...prev, [extraId]: quantity }))
    }
  }

  const onSubmit = async (data: ModificationFormData) => {
    try {
      setIsSubmitting(true)

      const services = Object.entries(selectedServices).map(([service_item_id, quantity]) => ({
        service_item_id,
        quantity
      }))

      const extras = Object.entries(selectedExtras).map(([service_extra_id, quantity]) => ({
        service_extra_id,
        quantity
      }))

      const response = await fetch(`/api/bookings/${booking.id}/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: {
            ...data,
            services,
            extras
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update booking')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating booking:', error)
      alert(error instanceof Error ? error.message : 'Failed to update booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatServiceDate = (date: string, time: string) => {
    const serviceDateTime = new Date(`${date}T${time}`)
    return format(serviceDateTime, 'MMM dd, yyyy \'at\' h:mm a')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modify Booking</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="extras">Extras</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Service Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="service_date">Service Date</Label>
                      <Input
                        id="service_date"
                        type="date"
                        {...register('service_date')}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {errors.service_date && (
                        <p className="text-sm text-red-600">{errors.service_date.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service_time">Service Time</Label>
                      <Input
                        id="service_time"
                        type="time"
                        {...register('service_time')}
                      />
                      {errors.service_time && (
                        <p className="text-sm text-red-600">{errors.service_time.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      {...register('notes')}
                      placeholder="Any special instructions or notes..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serviceItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <p className="text-sm font-medium text-green-600">
                            ₦{item.base_price.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateServiceQuantity(item.id, (selectedServices[item.id] || 0) - 1)}
                            disabled={!selectedServices[item.id]}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">
                            {selectedServices[item.id] || 0}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateServiceQuantity(item.id, (selectedServices[item.id] || 0) + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="extras" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Extras</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serviceExtras.map((extra) => (
                      <div key={extra.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{extra.name}</h3>
                          <p className="text-sm text-gray-600">{extra.description}</p>
                          <p className="text-sm font-medium text-green-600">
                            ₦{extra.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateExtraQuantity(extra.id, (selectedExtras[extra.id] || 0) - 1)}
                            disabled={!selectedExtras[extra.id]}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">
                            {selectedExtras[extra.id] || 0}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateExtraQuantity(extra.id, (selectedExtras[extra.id] || 0) + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="address" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Service Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Select value={selectedAddressId} onValueChange={(value) => setValue('address_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an address" />
                      </SelectTrigger>
                      <SelectContent>
                        {addresses.map((address) => (
                          <SelectItem key={address.id} value={address.id}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{address.name}</span>
                              {address.is_default && (
                                <Badge variant="outline" className="text-xs">Default</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Service Date:</span>
                  <span>{formatServiceDate(watch('service_date'), watch('service_time'))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Selected Services:</span>
                  <span>{Object.keys(selectedServices).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Selected Extras:</span>
                  <span>{Object.keys(selectedExtras).length}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount:</span>
                  <span>₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Updating...' : 'Update Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
