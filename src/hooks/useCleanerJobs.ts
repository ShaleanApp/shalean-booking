'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from './useProfile'

export interface CleanerJob {
  id: string
  service_date: string
  service_time: string
  status: string
  total_price: number
  customer_name: string
  customer_phone: string
  address: {
    street_address: string
    city: string
    state: string
    postal_code: string
    address_type: string
  }
  services: Array<{
    service_item: {
      name: string
      description: string
      price: number
      duration_minutes: number
    }
    quantity: number
  }>
  extras: Array<{
    service_extra: {
      name: string
      description: string
      price: number
    }
  }>
  notes?: string
  rating?: number
  review?: string
}

export function useCleanerJobs() {
  const [jobs, setJobs] = useState<CleanerJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useProfile()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    fetchJobs()
  }, [user])

  const fetchJobs = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          service_date,
          service_time,
          status,
          total_price,
          notes,
          rating,
          review,
          profiles!bookings_customer_id_fkey (
            full_name,
            phone
          ),
          addresses (
            street_address,
            city,
            state,
            postal_code,
            address_type
          ),
          booking_services (
            quantity,
            service_items (
              name,
              description,
              price,
              duration_minutes
            )
          ),
          booking_extras (
            service_extras (
              name,
              description,
              price
            )
          )
        `)
        .eq('cleaner_id', user.id)
        .order('service_date', { ascending: true })
        .order('service_time', { ascending: true })

      if (error) {
        console.error('Error fetching cleaner jobs:', error)
        return
      }

      // Transform the data to match our interface
      const transformedJobs: CleanerJob[] = data?.map(booking => ({
        id: booking.id,
        service_date: booking.service_date,
        service_time: booking.service_time,
        status: booking.status,
        total_price: booking.total_price,
        customer_name: (booking.profiles as any)?.full_name || 'Unknown',
        customer_phone: (booking.profiles as any)?.phone || '',
        address: {
          street_address: (booking.addresses as any)?.street_address || '',
          city: (booking.addresses as any)?.city || '',
          state: (booking.addresses as any)?.state || '',
          postal_code: (booking.addresses as any)?.postal_code || '',
          address_type: (booking.addresses as any)?.address_type || 'home'
        },
        services: booking.booking_services?.map(bs => ({
          service_item: {
            name: (bs.service_items as any)?.name || '',
            description: (bs.service_items as any)?.description || '',
            price: (bs.service_items as any)?.price || 0,
            duration_minutes: (bs.service_items as any)?.duration_minutes || 0
          },
          quantity: bs.quantity
        })) || [],
        extras: booking.booking_extras?.map(be => ({
          service_extra: {
            name: be.service_extras?.name || '',
            description: be.service_extras?.description || '',
            price: be.service_extras?.price || 0
          }
        })) || [],
        notes: booking.notes,
        rating: booking.rating,
        review: booking.review
      })) || []

      setJobs(transformedJobs)
    } catch (error) {
      console.error('Error fetching cleaner jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', jobId)
        .eq('cleaner_id', user?.id)

      if (error) {
        console.error('Error updating job status:', error)
        return false
      }

      // Refresh the jobs list
      await fetchJobs()
      return true
    } catch (error) {
      console.error('Error updating job status:', error)
      return false
    }
  }

  const getTodaysJobs = () => {
    const today = new Date().toISOString().split('T')[0]
    return jobs.filter(job => job.service_date === today)
  }

  const getUpcomingJobs = () => {
    const today = new Date().toISOString().split('T')[0]
    return jobs.filter(job => job.service_date > today)
  }

  const getCompletedJobs = () => {
    return jobs.filter(job => job.status === 'completed')
  }

  return {
    jobs,
    isLoading,
    refetch: fetchJobs,
    updateJobStatus,
    getTodaysJobs,
    getUpcomingJobs,
    getCompletedJobs
  }
}
