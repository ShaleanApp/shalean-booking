'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/browser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DollarSign, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Download,
  Eye
} from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { format } from 'date-fns'
import Link from 'next/link'

interface PaymentWithBooking {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method: string
  transaction_id: string
  paystack_reference: string
  created_at: string
  updated_at: string
  booking: {
    id: string
    service_date: string
    service_time: string
    total_price: number
    services: Array<{
      service_item: {
        name: string
      }
    }>
  }
}

export function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentWithBooking[]>([])
  const [filteredPayments, setFilteredPayments] = useState<PaymentWithBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { user } = useProfile()
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    if (user) {
      fetchPayments()
    }
  }, [user])

  useEffect(() => {
    filterPayments()
  }, [payments, searchTerm, statusFilter])

  const fetchPayments = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings(
            id,
            service_date,
            service_time,
            total_price,
            services:booking_services(
              service_item:service_items(name)
            )
          )
        `)
        .eq('booking.customer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching payments:', error)
        return
      }

      setPayments(data || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterPayments = () => {
    let filtered = payments

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.booking?.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.booking?.services?.[0]?.service_item?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter)
    }

    setFilteredPayments(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'failed':
        return <XCircle className="h-4 w-4" />
      case 'refunded':
        return <DollarSign className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'NGN') {
      return `₦${(amount / 100).toLocaleString()}` // Convert from kobo to naira
    }
    return `${currency} ${amount.toLocaleString()}`
  }

  const formatPaymentDate = (date: string) => {
    return format(new Date(date), 'MMM dd, yyyy \'at\' h:mm a')
  }

  const canRefund = (payment: PaymentWithBooking) => {
    const paymentDate = new Date(payment.created_at)
    const now = new Date()
    const daysSincePayment = (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24)
    
    return payment.status === 'completed' && daysSincePayment <= 7
  }

  const handleRefund = async (paymentId: string) => {
    if (!confirm('Are you sure you want to request a refund for this payment?')) return

    try {
      // In a real implementation, this would call a refund API
      console.log('Refund requested for payment:', paymentId)
      // For now, just show a message
      alert('Refund request submitted. You will be contacted within 24 hours.')
    } catch (error) {
      console.error('Error requesting refund:', error)
    }
  }

  const totalSpent = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + (payment.amount / 100), 0)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your payment history...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.filter(p => p.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.filter(p => p.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search payments..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'You haven\'t made any payments yet.'
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
          {filteredPayments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">
                        {payment.booking?.services?.[0]?.service_item?.name || 'Cleaning Service'}
                      </h3>
                      <Badge className={getStatusColor(payment.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(payment.status)}
                          {payment.status.toUpperCase()}
                        </div>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">{formatAmount(payment.amount, payment.currency)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CreditCard className="h-4 w-4" />
                        <span>{payment.payment_method.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Transaction: {payment.transaction_id.slice(-8)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{formatPaymentDate(payment.created_at)}</span>
                      </div>
                    </div>

                    {payment.booking && (
                      <div className="text-sm text-gray-600">
                        <strong>Service Date:</strong> {format(new Date(`${payment.booking.service_date}T${payment.booking.service_time}`), 'MMM dd, yyyy \'at\' h:mm a')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/booking/confirmation?booking=${payment.booking?.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Booking
                      </Link>
                    </Button>
                    
                    {canRefund(payment) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRefund(payment.id)}
                      >
                        Request Refund
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
