'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/browser'
import { useProfile } from './useProfile'

interface CustomerStats {
  upcomingBookings: number
  upcomingBookingsChange: number
  totalSpent: number
  totalSpentChange: number
  completedServices: number
  savedAddresses: number
}

export function useCustomerStats() {
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useProfile()
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    fetchStats()
  }, [user])

  const fetchStats = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      // Fetch upcoming bookings (next 30 days)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      
      const { data: upcomingBookings, error: upcomingError } = await supabase
        .from('bookings')
        .select('id')
        .eq('customer_id', user.id)
        .in('status', ['pending', 'confirmed'])
        .gte('service_date', new Date().toISOString().split('T')[0])
        .lte('service_date', thirtyDaysFromNow.toISOString().split('T')[0])

      // Fetch total spent
      const { data: totalSpentData, error: totalSpentError } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('customer_id', user.id)
        .in('status', ['confirmed', 'completed'])

      // Fetch completed services
      const { data: completedServices, error: completedError } = await supabase
        .from('bookings')
        .select('id')
        .eq('customer_id', user.id)
        .eq('status', 'completed')

      // Fetch saved addresses
      const { data: addresses, error: addressesError } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', user.id)

      // Calculate previous month stats for comparison
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      
      const { data: previousMonthBookings, error: prevBookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('customer_id', user.id)
        .in('status', ['pending', 'confirmed'])
        .gte('service_date', oneMonthAgo.toISOString().split('T')[0])
        .lt('service_date', new Date().toISOString().split('T')[0])

      const { data: previousMonthSpent, error: prevSpentError } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('customer_id', user.id)
        .in('status', ['confirmed', 'completed'])
        .gte('created_at', oneMonthAgo.toISOString())
        .lt('created_at', new Date().toISOString())

      if (upcomingError || totalSpentError || completedError || addressesError) {
        console.error('Error fetching stats:', { upcomingError, totalSpentError, completedError, addressesError })
        return
      }

      const totalSpent = totalSpentData?.reduce((sum, booking) => sum + booking.total_price, 0) || 0
      const previousMonthTotal = previousMonthSpent?.reduce((sum, booking) => sum + booking.total_price, 0) || 0
      
      const upcomingCount = upcomingBookings?.length || 0
      const previousUpcomingCount = previousMonthBookings?.length || 0
      
      const totalSpentChange = previousMonthTotal > 0 
        ? Math.round(((totalSpent - previousMonthTotal) / previousMonthTotal) * 100)
        : 0

      const upcomingChange = previousUpcomingCount > 0
        ? upcomingCount - previousUpcomingCount
        : 0

      setStats({
        upcomingBookings: upcomingCount,
        upcomingBookingsChange: upcomingChange,
        totalSpent,
        totalSpentChange,
        completedServices: completedServices?.length || 0,
        savedAddresses: addresses?.length || 0
      })
    } catch (error) {
      console.error('Error fetching customer stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return { stats, isLoading, refetch: fetchStats }
}
