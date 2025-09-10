"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBooking } from '@/contexts/BookingContext'
import { ServiceItem, ServiceExtra, Address } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  FileText,
  Download,
  Share2
} from 'lucide-react'

interface BookingConfirmationProps {
  bookingId?: string
  className?: string
}

export function BookingConfirmation({ bookingId, className }: BookingConfirmationProps) {
  const { state, clearDraft } = useBooking()
  const [services, setServices] = useState<ServiceItem[]>([])
  const [extras, setExtras] = useState<ServiceExtra[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fetch service details for display
  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const supabase = createClient()
        
        // Fetch service items
        if (state.formData.services.length > 0) {
          const serviceIds = state.formData.services.map(s => s.service_item_id)
          const { data: servicesData, error: servicesError } = await supabase
            .from('service_items')
            .select('*')
            .in('id', serviceIds)

          if (servicesError) throw servicesError
          setServices(servicesData || [])
        }

        // Fetch extras
        if (state.formData.extras.length > 0) {
          const extraIds = state.formData.extras.map(e => e.service_extra_id)
          const { data: extrasData, error: extrasError } = await supabase
            .from('service_extras')
            .select('*')
            .in('id', extraIds)

          if (extrasError) throw extrasError
          setExtras(extrasData || [])
        }

        // Fetch selected address if using saved address
        if (state.formData.address_id) {
          const { data: addressData, error: addressError } = await supabase
            .from('addresses')
            .select('*')
            .eq('id', state.formData.address_id)
            .single()

          if (addressError) throw addressError
          setSelectedAddress(addressData)
        }
      } catch (error) {
        console.error('Error fetching service details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchServiceDetails()
  }, [state.formData.services, state.formData.extras, state.formData.address_id])

  const calculateTotal = () => {
    let total = 0

    // Calculate services total
    state.formData.services.forEach(serviceData => {
      const service = services.find(s => s.id === serviceData.service_item_id)
      if (service) {
        total += service.base_price * serviceData.quantity
      }
    })

    // Calculate extras total
    state.formData.extras.forEach(extraData => {
      const extra = extras.find(e => e.id === extraData.service_extra_id)
      if (extra) {
        total += extra.price * extraData.quantity
      }
    })

    return total
  }

  const handleNewBooking = () => {
    clearDraft()
    router.push('/book')
  }

  const handleViewBookings = () => {
    router.push('/dashboard')
  }

  const handleDownloadReceipt = () => {
    // TODO: Implement receipt download
    console.log('Download receipt functionality to be implemented')
  }

  const handleShareBooking = () => {
    // TODO: Implement booking sharing
    console.log('Share booking functionality to be implemented')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    )
  }

  const total = calculateTotal()

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">
            Your cleaning service has been successfully booked. You will receive a confirmation email shortly.
          </p>
        </div>
        {bookingId && (
          <Badge variant="outline" className="text-sm">
            Booking ID: {bookingId}
          </Badge>
        )}
      </div>

      {/* Booking Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Services Booked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.formData.services.map((serviceData) => {
                const service = services.find(s => s.id === serviceData.service_item_id)
                if (!service) return null
                
                return (
                  <div key={serviceData.service_item_id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-muted-foreground">Quantity: {serviceData.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(service.base_price * serviceData.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                )
              })}
              
              {state.formData.extras.map((extraData) => {
                const extra = extras.find(e => e.id === extraData.service_extra_id)
                if (!extra) return null
                
                return (
                  <div key={extraData.service_extra_id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <h4 className="font-medium">{extra.name}</h4>
                      <p className="text-sm text-muted-foreground">Quantity: {extraData.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(extra.price * extraData.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Address */}
        <div className="space-y-6">
          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-medium">
                    {new Date(state.formData.service_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-medium">{state.formData.service_time}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Service Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedAddress ? (
                <div>
                  <h4 className="font-medium">{selectedAddress.name}</h4>
                  <p className="text-muted-foreground">
                    {selectedAddress.address_line_1}
                    {selectedAddress.address_line_2 && `, ${selectedAddress.address_line_2}`}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postal_code}
                  </p>
                </div>
              ) : state.formData.new_address ? (
                <div>
                  <h4 className="font-medium">{state.formData.new_address.name}</h4>
                  <p className="text-muted-foreground">
                    {state.formData.new_address.address_line_1}
                    {state.formData.new_address.address_line_2 && `, ${state.formData.new_address.address_line_2}`}
                  </p>
                  <p className="text-muted-foreground">
                    {state.formData.new_address.city}, {state.formData.new_address.state} {state.formData.new_address.postal_code}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No address selected</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Total & Actions */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center text-lg font-semibold mb-4">
            <span>Total Amount</span>
            <span>${total.toFixed(2)}</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleViewBookings} className="flex-1 min-w-[120px]">
              View My Bookings
            </Button>
            <Button variant="outline" onClick={handleNewBooking} className="flex-1 min-w-[120px]">
              Book Another Service
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadReceipt}>
              <Download className="w-4 h-4 mr-2" />
              Receipt
            </Button>
            <Button variant="outline" size="sm" onClick={handleShareBooking}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      {state.formData.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Special Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{state.formData.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
