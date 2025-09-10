'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DollarSign, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { Payment, Booking } from '@/types'

interface PaymentWithBooking extends Payment {
  booking: Booking & {
    customer: {
      full_name: string
      email: string
    }
  }
}

export default function AdminPaymentsPage() {
  const { profile, loading } = useProfile()
  const [payments, setPayments] = useState<PaymentWithBooking[]>([])
  const [filteredPayments, setFilteredPayments] = useState<PaymentWithBooking[]>([])
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    failedPayments: 0,
    todayRevenue: 0
  })
  const [webhookStatus, setWebhookStatus] = useState<'online' | 'offline' | 'unknown'>('unknown')

  const supabase = createClient()

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchPayments()
      checkWebhookStatus()
    }
  }, [profile])

  useEffect(() => {
    filterPayments()
  }, [payments, searchTerm, statusFilter, dateFilter])

  const fetchPayments = async () => {
    try {
      setLoadingPayments(true)
      
      // Fetch payments with booking and customer data
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings(
            *,
            customer:profiles!bookings_customer_id_fkey(
              full_name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (paymentsError) throw paymentsError

      setPayments(paymentsData || [])
      calculateStats(paymentsData || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoadingPayments(false)
    }
  }

  const calculateStats = (paymentsData: PaymentWithBooking[]) => {
    const totalRevenue = paymentsData
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0)

    const pendingPayments = paymentsData.filter(p => p.status === 'pending').length
    const failedPayments = paymentsData.filter(p => p.status === 'failed').length

    const today = new Date().toDateString()
    const todayRevenue = paymentsData
      .filter(p => p.status === 'completed' && new Date(p.created_at).toDateString() === today)
      .reduce((sum, payment) => sum + payment.amount, 0)

    setStats({
      totalRevenue,
      pendingPayments,
      failedPayments,
      todayRevenue
    })
  }

  const filterPayments = () => {
    let filtered = payments

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.booking?.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.booking?.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.paystack_reference?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const lastWeek = new Date(today)
      lastWeek.setDate(lastWeek.getDate() - 7)
      const lastMonth = new Date(today)
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.created_at)
        switch (dateFilter) {
          case 'today':
            return paymentDate.toDateString() === today.toDateString()
          case 'yesterday':
            return paymentDate.toDateString() === yesterday.toDateString()
          case 'last_week':
            return paymentDate >= lastWeek && paymentDate < today
          case 'last_month':
            return paymentDate >= lastMonth && paymentDate < today
          default:
            return true
        }
      })
    }

    setFilteredPayments(filtered)
  }

  const retryPayment = async (paymentId: string) => {
    try {
      // This would trigger a retry of the payment
      // For now, we'll just update the status to pending
      const { error } = await supabase
        .from('payments')
        .update({ status: 'pending' })
        .eq('id', paymentId)

      if (error) throw error

      // Refresh payments
      fetchPayments()
    } catch (error) {
      console.error('Error retrying payment:', error)
    }
  }

  const refundPayment = async (paymentId: string) => {
    try {
      // This would process a refund
      const { error } = await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('id', paymentId)

      if (error) throw error

      // Refresh payments
      fetchPayments()
    } catch (error) {
      console.error('Error refunding payment:', error)
    }
  }

  const checkWebhookStatus = async () => {
    try {
      // Check if webhook endpoint is accessible
      const response = await fetch('/api/webhooks/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': 'test'
        },
        body: JSON.stringify({ test: true })
      })
      
      // If we get a 401, the webhook is working but signature is invalid (expected)
      setWebhookStatus(response.status === 401 ? 'online' : 'offline')
    } catch (error) {
      console.error('Error checking webhook status:', error)
      setWebhookStatus('offline')
    }
  }

  const testWebhook = async () => {
    try {
      // Simulate a test webhook event
      const testPayload = {
        event: 'payment.completed',
        data: {
          payment_id: 'test-payment-id',
          amount: 10000,
          currency: 'NGN',
          reference: 'test-ref-123',
          booking_id: 'test-booking-id'
        }
      }

      const response = await fetch('/api/webhooks/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': 'sha256=test-secret'
        },
        body: JSON.stringify(testPayload)
      })

      if (response.ok) {
        alert('Webhook test successful!')
      } else {
        alert('Webhook test failed. Check console for details.')
      }
    } catch (error) {
      console.error('Error testing webhook:', error)
      alert('Webhook test failed. Check console for details.')
    }
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
        return 'bg-gray-100 text-gray-800'
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
        return <RefreshCw className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          <h1 className="text-3xl font-bold text-gray-900">Payments Management</h1>
          <p className="mt-2 text-gray-600">
            Monitor payments, process refunds, and track revenue
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.todayRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPayments}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting completion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failedPayments}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Webhook Status */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  webhookStatus === 'online' ? 'bg-green-500' : 
                  webhookStatus === 'offline' ? 'bg-red-500' : 
                  'bg-yellow-500'
                }`}></div>
                <div>
                  <h3 className="font-medium">Payment Webhook Status</h3>
                  <p className="text-sm text-gray-500">
                    {webhookStatus === 'online' ? 'Webhook endpoint is active' : 
                     webhookStatus === 'offline' ? 'Webhook endpoint is offline' : 
                     'Checking webhook status...'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={checkWebhookStatus}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Status
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testWebhook}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Test Webhook
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search payments..."
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last_week">Last Week</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={fetchPayments} variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <div className="space-y-4">
          {loadingPayments ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-500">Try adjusting your filters or check back later.</p>
              </CardContent>
            </Card>
          ) : (
            filteredPayments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Payment #{payment.reference}
                        </h3>
                        <Badge className={getStatusColor(payment.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(payment.status)}
                            <span>{payment.status}</span>
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Customer</p>
                          <p className="text-sm text-gray-600">
                            {payment.booking?.customer?.full_name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.booking?.customer?.email}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-900">Amount</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.currency}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-900">Date</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(payment.created_at)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Payment Method: {payment.payment_method}
                          </p>
                        </div>
                      </div>

                      {/* Transaction Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Transaction ID</p>
                          <p className="text-sm text-gray-600 font-mono">
                            {payment.paystack_reference || 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-900">Booking Reference</p>
                          <p className="text-sm text-gray-600 font-mono">
                            {payment.booking?.id?.slice(-8) || 'N/A'}
                          </p>
                        </div>
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
                          <DropdownMenuItem>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {payment.status === 'failed' && (
                            <DropdownMenuItem 
                              onClick={() => retryPayment(payment.id)}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Retry Payment
                            </DropdownMenuItem>
                          )}
                          {payment.status === 'completed' && (
                            <DropdownMenuItem 
                              onClick={() => refundPayment(payment.id)}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Process Refund
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
      </div>
    </div>
  )
}
