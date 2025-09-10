'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  X,
  Eye
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { BookingWithDetails } from '@/types'
import { useProfile } from '@/hooks/useProfile'
import { format } from 'date-fns'
import Link from 'next/link'
import { BookingModificationModal } from './BookingModificationModal'

export function BookingHistory() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [filteredBookings, setFilteredBookings] = useState<BookingWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modifyingBooking, setModifyingBooking] = useState<BookingWithDetails | null>(null)
  const { user } = useProfile()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, statusFilter])

  const fetchBookings = async () => {
    if (!user) return

    try {
      setIsLoading(true)
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
        .eq('customer_id', user.id)
        .order('service_date', { ascending: false })

      if (error) {
        console.error('Error fetching bookings:', error)
        return
      }

      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.services?.some(service => 
          service.service_item?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        booking.address?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    setFilteredBookings(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatServiceDate = (date: string, time: string) => {
    const serviceDateTime = new Date(`${date}T${time}`)
    return format(serviceDateTime, 'MMM dd, yyyy \'at\' h:mm a')
  }

  const canModifyBooking = (booking: BookingWithDetails) => {
    const serviceDate = new Date(`${booking.service_date}T${booking.service_time}`)
    const now = new Date()
    const hoursUntilService = (serviceDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    return booking.status === 'pending' || booking.status === 'confirmed' && hoursUntilService > 24
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to cancel booking')
      }

      // Refresh bookings
      await fetchBookings()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert(error instanceof Error ? error.message : 'Failed to cancel booking')
    }
  }

  const handleModifyBooking = (booking: BookingWithDetails) => {
    setModifyingBooking(booking)
  }

  const handleModificationSuccess = () => {
    fetchBookings()
    setModifyingBooking(null)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'You haven\'t made any bookings yet.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button asChild>
                <Link href="/book">Book Your First Service</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">
                        {booking.services?.[0]?.service_item?.name || 'Cleaning Service'}
                        {booking.services && booking.services.length > 1 && 
                          ` +${booking.services.length - 1} more`
                        }
                      </h3>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatServiceDate(booking.service_date, booking.service_time)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{booking.address?.name || 'Service Address'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>₦{booking.total_price.toLocaleString()}</span>
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="text-sm text-gray-600 mb-4">
                        <strong>Notes:</strong> {booking.notes}
                      </p>
                    )}

                    {/* Services Details */}
                    {booking.services && booking.services.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Services:</h4>
                        <div className="space-y-1">
                          {booking.services.map((service, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              {service.quantity}x {service.service_item?.name} - ₦{service.total_price.toLocaleString()}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extras Details */}
                    {booking.extras && booking.extras.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Extras:</h4>
                        <div className="space-y-1">
                          {booking.extras.map((extra, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              {extra.quantity}x {extra.service_extra?.name} - ₦{extra.total_price.toLocaleString()}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/booking/confirmation?booking=${booking.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    
                    {canModifyBooking(booking) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleModifyBooking(booking)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modify
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-red-600"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Modification Modal */}
      {modifyingBooking && (
        <BookingModificationModal
          booking={modifyingBooking}
          isOpen={!!modifyingBooking}
          onClose={() => setModifyingBooking(null)}
          onSuccess={handleModificationSuccess}
        />
      )}
    </div>
  )
}
