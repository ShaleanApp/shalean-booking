'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar, 
  Search, 
  Filter, 
  User, 
  MapPin, 
  Clock, 
  DollarSign,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Dialog as EditDialog, 
  DialogContent as EditDialogContent, 
  DialogHeader as EditDialogHeader, 
  DialogTitle as EditDialogTitle, 
  DialogTrigger as EditDialogTrigger 
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createSupabaseBrowser } from '@/lib/supabase/browser'
import { BookingWithDetails, BookingStatus, Profile } from '@/types'

export default function BookingsClient() {
  const { profile, loading } = useProfile()
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [filteredBookings, setFilteredBookings] = useState<BookingWithDetails[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [availableCleaners, setAvailableCleaners] = useState<Profile[]>([])
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null)
  const [assignCleanerOpen, setAssignCleanerOpen] = useState(false)
  const [editBookingOpen, setEditBookingOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    service_date: '',
    service_time: '',
    notes: '',
    special_instructions: ''
  })

  const supabase = createSupabaseBrowser()

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchBookings()
      fetchAvailableCleaners()
    }
  }, [profile])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, statusFilter, dateFilter])

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true)
      
      // Fetch bookings with all related data
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:profiles!bookings_customer_id_fkey(*),
          cleaner:profiles!bookings_cleaner_id_fkey(*),
          address:addresses(*),
          payment:payments(*),
          services:booking_services(
            *,
            service_item:service_items(*)
          ),
          extras:booking_extras(
            *,
            service_extra:service_extras(*)
          )
        `)
        .order('created_at', { ascending: false })

      if (bookingsError) throw bookingsError

      const safeBookingsData = Array.isArray(bookingsData) ? bookingsData : []
      setBookings(safeBookingsData)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoadingBookings(false)
    }
  }

  const fetchAvailableCleaners = async () => {
    try {
      const { data: cleanersData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'cleaner')
        .order('full_name')

      if (error) throw error
      const safeCleanersData = Array.isArray(cleanersData) ? cleanersData : []
      setAvailableCleaners(safeCleanersData)
    } catch (error) {
      console.error('Error fetching cleaners:', error)
    }
  }

  const openAssignCleanerModal = (booking: BookingWithDetails) => {
    setSelectedBooking(booking)
    setAssignCleanerOpen(true)
  }

  const openEditBookingModal = (booking: BookingWithDetails) => {
    setSelectedBooking(booking)
    setEditForm({
      service_date: booking.service_date,
      service_time: booking.service_time,
      notes: booking.notes || '',
      special_instructions: booking.notes || '' // Use notes as special_instructions
    })
    setEditBookingOpen(true)
  }

  const handleAssignCleaner = async (cleanerId: string) => {
    if (!selectedBooking) return

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ cleaner_id: cleanerId })
        .eq('id', selectedBooking.id)

      if (error) throw error

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === selectedBooking.id 
            ? { ...booking, cleaner_id: cleanerId }
            : booking
        )
      )

      setAssignCleanerOpen(false)
      setSelectedBooking(null)
    } catch (error) {
      console.error('Error assigning cleaner:', error)
    }
  }

  const handleUpdateBooking = async () => {
    if (!selectedBooking) return

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          service_date: editForm.service_date,
          service_time: editForm.service_time,
          notes: editForm.notes,
          special_instructions: editForm.special_instructions
        })
        .eq('id', selectedBooking.id)

      if (error) throw error

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === selectedBooking.id 
            ? { 
                ...booking, 
                service_date: editForm.service_date,
                service_time: editForm.service_time,
                notes: editForm.notes,
                special_instructions: editForm.special_instructions
              }
            : booking
        )
      )

      setEditBookingOpen(false)
      setSelectedBooking(null)
    } catch (error) {
      console.error('Error updating booking:', error)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)

      if (error) throw error

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      )
    } catch (error) {
      console.error('Error cancelling booking:', error)
    }
  }

  const filterBookings = () => {
    const safeBookings = Array.isArray(bookings) ? bookings : []
    let filtered = safeBookings

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)

      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.service_date)
        switch (dateFilter) {
          case 'today':
            return bookingDate.toDateString() === today.toDateString()
          case 'tomorrow':
            return bookingDate.toDateString() === tomorrow.toDateString()
          case 'this_week':
            return bookingDate >= today && bookingDate <= nextWeek
          case 'this_month':
            return bookingDate.getMonth() === today.getMonth() && 
                   bookingDate.getFullYear() === today.getFullYear()
          default:
            return true
        }
      })
    }

    setFilteredBookings(filtered)
  }

  const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)

      if (error) throw error

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus }
            : booking
        )
      )
    } catch (error) {
      console.error('Error updating booking status:', error)
    }
  }

  const assignCleaner = async (bookingId: string, cleanerId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ cleaner_id: cleanerId })
        .eq('id', bookingId)

      if (error) throw error

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, cleaner_id: cleanerId }
            : booking
        )
      )
    } catch (error) {
      console.error('Error assigning cleaner:', error)
    }
  }

  const getStatusColor = (status: BookingStatus) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="mt-2 text-gray-600">
            Manage all bookings, assign cleaners, and track service status
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={fetchBookings} variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="space-y-4">
          {loadingBookings ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (filteredBookings || []).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-500">Try adjusting your filters or check back later.</p>
              </CardContent>
            </Card>
          ) : (
            (filteredBookings || []).map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Booking #{booking.id.slice(-8)}
                        </h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {booking.customer?.full_name || 'Guest'}
                            </p>
                            <p className="text-xs text-gray-500">{booking.customer?.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(booking.service_date)}
                            </p>
                            <p className="text-xs text-gray-500">{booking.service_time}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {booking.address?.name || 'Address'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {booking.address?.city}, {booking.address?.state}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(booking.payment?.amount || 0)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {booking.payment?.status || 'No payment'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Services:</h4>
                        <div className="flex flex-wrap gap-2">
                          {(booking.services || []).map((service) => (
                            <Badge key={service.id} variant="outline">
                              {service.service_item?.name} x{service.quantity}
                            </Badge>
                          ))}
                          {(booking.extras || []).map((extra) => (
                            <Badge key={extra.id} variant="outline">
                              {extra.service_extra?.name} x{extra.quantity}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Cleaner Assignment */}
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Cleaner: {booking.cleaner?.full_name || 'Unassigned'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => openEditBookingModal(booking)}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          {!booking.cleaner_id && (
                            <DropdownMenuItem 
                              onClick={() => openAssignCleanerModal(booking)}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Assign Cleaner
                            </DropdownMenuItem>
                          )}
                          {booking.status === 'pending' && (
                            <DropdownMenuItem 
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Confirm
                            </DropdownMenuItem>
                          )}
                          {booking.status === 'confirmed' && (
                            <DropdownMenuItem 
                              onClick={() => updateBookingStatus(booking.id, 'in_progress')}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Start Service
                            </DropdownMenuItem>
                          )}
                          {booking.status === 'in_progress' && (
                            <DropdownMenuItem 
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Complete
                            </DropdownMenuItem>
                          )}
                          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <DropdownMenuItem 
                              onClick={() => handleCancelBooking(booking.id)}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Assign Cleaner Modal */}
        <Dialog open={assignCleanerOpen} onOpenChange={setAssignCleanerOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Cleaner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select a cleaner to assign to booking #{selectedBooking?.id.slice(-8)}
              </p>
              <div className="space-y-2">
                {(availableCleaners || []).map((cleaner) => (
                  <div
                    key={cleaner.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => handleAssignCleaner(cleaner.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium">{cleaner.full_name}</p>
                        <p className="text-sm text-gray-500">{cleaner.email}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Assign
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Booking Modal */}
        <EditDialog open={editBookingOpen} onOpenChange={setEditBookingOpen}>
          <EditDialogContent>
            <EditDialogHeader>
              <EditDialogTitle>Edit Booking Details</EditDialogTitle>
            </EditDialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service_date">Service Date</Label>
                  <Input
                    id="service_date"
                    type="date"
                    value={editForm.service_date}
                    onChange={(e) => setEditForm(prev => ({ ...prev, service_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="service_time">Service Time</Label>
                  <Input
                    id="service_time"
                    type="time"
                    value={editForm.service_time}
                    onChange={(e) => setEditForm(prev => ({ ...prev, service_time: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this booking..."
                />
              </div>
              <div>
                <Label htmlFor="special_instructions">Special Instructions</Label>
                <Textarea
                  id="special_instructions"
                  value={editForm.special_instructions}
                  onChange={(e) => setEditForm(prev => ({ ...prev, special_instructions: e.target.value }))}
                  placeholder="Any special instructions for the cleaner..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditBookingOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateBooking}>
                  Save Changes
                </Button>
              </div>
            </div>
          </EditDialogContent>
        </EditDialog>
      </div>
    </div>
  )
}
