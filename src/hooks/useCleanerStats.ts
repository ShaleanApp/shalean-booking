'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/browser'
import { useProfile } from './useProfile'

interface CleanerStats {
  todaysJobs: number
  completedToday: number
  remainingToday: number
  weeklyEarnings: number
  weeklyEarningsChange: number
  averageRating: number
  totalReviews: number
  totalJobsCompleted: number
}

export function useCleanerStats() {
  const [stats, setStats] = useState<CleanerStats | null>(null)
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

      // Get today's date range
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

      // Get this week's date range
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)

      // Get last week's date range for comparison
      const startOfLastWeek = new Date(startOfWeek)
      startOfLastWeek.setDate(startOfWeek.getDate() - 7)
      
      const endOfLastWeek = new Date(startOfWeek)

      // Fetch today's jobs
      const { data: todaysJobs, error: todaysJobsError } = await supabase
        .from('bookings')
        .select('id, status, cleaner_id')
        .eq('cleaner_id', user.id)
        .gte('service_date', startOfDay.toISOString().split('T')[0])
        .lt('service_date', endOfDay.toISOString().split('T')[0])

      // Fetch completed jobs today
      const { data: completedToday, error: completedTodayError } = await supabase
        .from('bookings')
        .select('id')
        .eq('cleaner_id', user.id)
        .eq('status', 'completed')
        .gte('service_date', startOfDay.toISOString().split('T')[0])
        .lt('service_date', endOfDay.toISOString().split('T')[0])

      // Fetch this week's earnings
      const { data: weeklyEarningsData, error: weeklyEarningsError } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('cleaner_id', user.id)
        .eq('status', 'completed')
        .gte('service_date', startOfWeek.toISOString().split('T')[0])
        .lt('service_date', endOfWeek.toISOString().split('T')[0])

      // Fetch last week's earnings for comparison
      const { data: lastWeekEarningsData, error: lastWeekEarningsError } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('cleaner_id', user.id)
        .eq('status', 'completed')
        .gte('service_date', startOfLastWeek.toISOString().split('T')[0])
        .lt('service_date', endOfLastWeek.toISOString().split('T')[0])

      // Fetch total completed jobs
      const { data: totalCompletedJobs, error: totalCompletedError } = await supabase
        .from('bookings')
        .select('id')
        .eq('cleaner_id', user.id)
        .eq('status', 'completed')

      // Fetch reviews and ratings
      const { data: reviews, error: reviewsError } = await supabase
        .from('bookings')
        .select('rating, review')
        .eq('cleaner_id', user.id)
        .not('rating', 'is', null)

      if (todaysJobsError || completedTodayError || weeklyEarningsError || totalCompletedError || reviewsError) {
        console.error('Error fetching cleaner stats:', { 
          todaysJobsError, 
          completedTodayError, 
          weeklyEarningsError, 
          totalCompletedError, 
          reviewsError 
        })
        return
      }

      // Calculate earnings
      const weeklyEarnings = weeklyEarningsData?.reduce((sum, booking) => sum + booking.total_price, 0) || 0
      const lastWeekEarnings = lastWeekEarningsData?.reduce((sum, booking) => sum + booking.total_price, 0) || 0
      
      const weeklyEarningsChange = lastWeekEarnings > 0 
        ? Math.round(((weeklyEarnings - lastWeekEarnings) / lastWeekEarnings) * 100)
        : 0

      // Calculate average rating
      const validReviews = reviews?.filter(r => r.rating !== null) || []
      const averageRating = validReviews.length > 0 
        ? validReviews.reduce((sum, review) => sum + review.rating, 0) / validReviews.length
        : 0

      const todaysJobsCount = todaysJobs?.length || 0
      const completedTodayCount = completedToday?.length || 0
      const remainingTodayCount = todaysJobsCount - completedTodayCount

      setStats({
        todaysJobs: todaysJobsCount,
        completedToday: completedTodayCount,
        remainingToday: remainingTodayCount,
        weeklyEarnings,
        weeklyEarningsChange,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalReviews: validReviews.length,
        totalJobsCompleted: totalCompletedJobs?.length || 0
      })
    } catch (error) {
      console.error('Error fetching cleaner stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return { stats, isLoading, refetch: fetchStats }
}
