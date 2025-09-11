'use client'

"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { BookingConfirmation } from '@/components/booking/BookingConfirmation'
import { createSupabaseBrowser } from '@/lib/supabase/browser'
import { BookingWithDetails } from '@/types'
import { Loader2 } from 'lucide-react'

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('booking')
  const [booking, setBooking] = useState<BookingWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError('No booking ID provided')
        setLoading(false)
        return
      }

      try {
        const supabase = createSupabaseBrowser()
        
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            customer:profiles!bookings_customer_id_fkey(*),
            cleaner:profiles!bookings_cleaner_id_fkey(*),
            services:booking_services(
              *,
              service_item:service_items(*)
            ),
            extras:booking_extras(
              *,
              service_extra:service_extras(*)
            ),
            address:addresses(*),
            payment:payments(*)
          `)
          .eq('id', bookingId)
          .single()

        if (error) {
          throw error
        }

        setBooking(data)
      } catch (error) {
        console.error('Error fetching booking:', error)
        setError('Failed to load booking details')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading booking details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Booking Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error || 'The booking you are looking for could not be found.'}
            </p>
            <a
              href="/book"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Book a New Service
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
      <div className="container mx-auto px-4">
        <BookingConfirmation 
          bookingId={booking.id}
          className="max-w-4xl mx-auto"
        />
      </div>
    </div>
  )
}
