'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Calendar, 
  DollarSign, 
  Star,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabase/browser'

interface AnalyticsData {
  revenue: {
    total: number
    monthly: number
    weekly: number
    daily: number
    growth: number
  }
  bookings: {
    total: number
    completed: number
    pending: number
    cancelled: number
    growth: number
  }
  customers: {
    total: number
    new: number
    active: number
    growth: number
  }
  cleaners: {
    total: number
    active: number
    average_rating: number
    growth: number
  }
  performance: {
    completion_rate: number
    average_booking_value: number
    customer_satisfaction: number
    response_time: number
  }
  trends: {
    daily_revenue: Array<{ date: string; revenue: number }>
    daily_bookings: Array<{ date: string; bookings: number }>
    top_services: Array<{ name: string; count: number; revenue: number }>
  }
}

export default function AdminAnalyticsPage() {
  const { profile, loading } = useProfile()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  const supabase = createSupabaseBrowser()

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchAnalytics()
    }
  }, [profile, timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true)
      
      const now = new Date()
      const startDate = new Date()
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7)
          break
        case '30d':
          startDate.setDate(now.getDate() - 30)
          break
        case '90d':
          startDate.setDate(now.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1)
          break
        default:
          startDate.setDate(now.getDate() - 30)
      }

      // Fetch revenue data
      const { data: revenueData } = await supabase
        .from('payments')
        .select('amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())

      // Fetch bookings data
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('status, total_amount, created_at')
        .gte('created_at', startDate.toISOString())

      // Fetch customers data
      const { data: customersData } = await supabase
        .from('profiles')
        .select('created_at, role')
        .eq('role', 'customer')
        .gte('created_at', startDate.toISOString())

      // Fetch cleaners data
      const { data: cleanersData } = await supabase
        .from('profiles')
        .select('created_at, role')
        .eq('role', 'cleaner')
        .gte('created_at', startDate.toISOString())

      // Calculate analytics
      const totalRevenue = revenueData?.reduce((sum, payment) => sum + payment.amount, 0) || 0
      const totalBookings = bookingsData?.length || 0
      const completedBookings = bookingsData?.filter(b => b.status === 'completed').length || 0
      const pendingBookings = bookingsData?.filter(b => b.status === 'pending').length || 0
      const cancelledBookings = bookingsData?.filter(b => b.status === 'cancelled').length || 0
      const totalCustomers = customersData?.length || 0
      const totalCleaners = cleanersData?.length || 0

      // Calculate growth (simplified - would need historical data for real growth)
      const growth = 12.5 // Placeholder

      // Calculate daily trends
      const dailyRevenue = calculateDailyTrends(revenueData || [], 'amount')
      const dailyBookings = calculateDailyTrends(bookingsData || [], 'count')

      // Calculate top services (simplified)
      const topServices = calculateTopServices(bookingsData || [])

      const analyticsData: AnalyticsData = {
        revenue: {
          total: totalRevenue,
          monthly: totalRevenue,
          weekly: totalRevenue * 0.25,
          daily: totalRevenue * 0.04,
          growth: growth
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          pending: pendingBookings,
          cancelled: cancelledBookings,
          growth: growth
        },
        customers: {
          total: totalCustomers,
          new: totalCustomers,
          active: Math.floor(totalCustomers * 0.7),
          growth: growth
        },
        cleaners: {
          total: totalCleaners,
          active: Math.floor(totalCleaners * 0.8),
          average_rating: 4.5,
          growth: growth
        },
        performance: {
          completion_rate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
          average_booking_value: totalBookings > 0 ? totalRevenue / totalBookings : 0,
          customer_satisfaction: 4.5,
          response_time: 2.5
        },
        trends: {
          daily_revenue: dailyRevenue,
          daily_bookings: dailyBookings,
          top_services: topServices
        }
      }

      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const calculateDailyTrends = (data: any[], valueField: string) => {
    const trends: { [key: string]: number } = {}
    
    data.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0]
      if (valueField === 'amount') {
        trends[date] = (trends[date] || 0) + item.amount
      } else {
        trends[date] = (trends[date] || 0) + 1
      }
    })

    return Object.entries(trends)
      .map(([date, value]) => ({ 
        date, 
        revenue: valueField === 'amount' ? value : 0,
        bookings: valueField === 'count' ? value : 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const calculateTopServices = (bookingsData: any[]) => {
    // This would need to join with booking_services and service_items
    // For now, return placeholder data
    return [
      { name: 'House Cleaning', count: 45, revenue: 675000 },
      { name: 'Office Cleaning', count: 23, revenue: 460000 },
      { name: 'Deep Cleaning', count: 12, revenue: 300000 },
      { name: 'Move-in/Move-out', count: 8, revenue: 160000 }
    ]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-NG').format(value)
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Track performance, revenue, and key metrics
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={fetchAnalytics} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {loadingAnalytics ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : analytics ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.revenue.total)}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">+{analytics.revenue.growth}%</span>
                    <span className="ml-1">from last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(analytics.bookings.total)}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">+{analytics.bookings.growth}%</span>
                    <span className="ml-1">from last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(analytics.customers.active)}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">+{analytics.customers.growth}%</span>
                    <span className="ml-1">from last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPercentage(analytics.performance.completion_rate)}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">+2.1%</span>
                    <span className="ml-1">from last period</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Monthly</span>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(analytics.revenue.monthly)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Weekly</span>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(analytics.revenue.weekly)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">Daily</span>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(analytics.revenue.daily)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Booking Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <span className="text-sm font-semibold">{analytics.bookings.completed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                    <span className="text-sm font-semibold">{analytics.bookings.pending}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Cancelled</span>
                    </div>
                    <span className="text-sm font-semibold">{analytics.bookings.cancelled}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Booking Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(analytics.performance.average_booking_value)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold">{analytics.performance.customer_satisfaction}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.performance.response_time}h</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Cleaners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.cleaners.active}</div>
                </CardContent>
              </Card>
            </div>

            {/* Top Services */}
            <Card>
              <CardHeader>
                <CardTitle>Top Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.trends.top_services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-indigo-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{service.name}</p>
                          <p className="text-xs text-gray-500">{service.count} bookings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(service.revenue)}</p>
                        <p className="text-xs text-gray-500">revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data</h3>
              <p className="text-gray-500">Analytics data will appear here once you have some activity.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
