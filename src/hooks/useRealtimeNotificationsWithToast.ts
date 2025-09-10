'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useToast } from '@/hooks/use-toast'
import { useProfile } from '@/hooks/useProfile'

interface Notification {
  id: string
  user_id: string
  channel: string
  type: string
  status: string
  payload: any
  sent_at: string | null
  delivered_at: string | null
  failed_at: string | null
  error_message: string | null
  created_at: string
  updated_at: string
  read: boolean
}

interface UseRealtimeNotificationsWithToastReturn {
  notifications: Notification[]
  loading: boolean
  error: string | null
  isConnected: boolean
  subscribe: () => void
  unsubscribe: () => void
}

// Helper function to get notification display info
function getNotificationDisplayInfo(notification: Notification) {
  const { type, payload } = notification
  
  switch (type) {
    case 'booking_confirmed':
      return {
        title: 'Booking Confirmed! 🎉',
        description: `Your cleaning service is confirmed for ${payload?.service_date || 'the scheduled date'}.`,
        variant: 'success' as const
      }
    case 'booking_started':
      return {
        title: 'Service Started',
        description: `Your cleaning service has begun at ${payload?.service_time || 'the scheduled time'}.`,
        variant: 'default' as const
      }
    case 'booking_completed':
      return {
        title: 'Service Completed! ✅',
        description: `Your cleaning service has been completed successfully.`,
        variant: 'success' as const
      }
    case 'booking_cancelled':
      return {
        title: 'Booking Cancelled',
        description: `Your cleaning service has been cancelled.`,
        variant: 'destructive' as const
      }
    case 'cleaner_assigned':
      return {
        title: 'Cleaner Assigned',
        description: `A professional cleaner has been assigned to your booking.`,
        variant: 'default' as const
      }
    case 'new_booking_assigned':
      return {
        title: 'New Assignment! 📋',
        description: `You have been assigned to a new cleaning job.`,
        variant: 'default' as const
      }
    case 'payment_successful':
      return {
        title: 'Payment Successful! 💳',
        description: `Your payment of $${payload?.amount || '0'} has been processed successfully.`,
        variant: 'success' as const
      }
    case 'payment_failed':
      return {
        title: 'Payment Failed',
        description: `There was an issue processing your payment. Please try again.`,
        variant: 'destructive' as const
      }
    case 'payment_refunded':
      return {
        title: 'Payment Refunded',
        description: `Your payment has been refunded successfully.`,
        variant: 'warning' as const
      }
    default:
      return {
        title: 'New Notification',
        description: `You have a new ${type.replace('_', ' ')} notification.`,
        variant: 'default' as const
      }
  }
}

export function useRealtimeNotificationsWithToast(): UseRealtimeNotificationsWithToastReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  
  const { toast } = useToast()
  const { user } = useProfile()
  const supabase = createClient()

  const subscribe = useCallback(() => {
    if (!user) {
      console.log('No user logged in, skipping real-time subscription')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Create a real-time channel for notifications
      const newChannel = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'notifications'
          },
          (payload) => {
            console.log('Real-time notification received:', payload)
            
            // Handle different event types
            switch (payload.eventType) {
              case 'INSERT':
                const newNotification = payload.new as Notification
                
                // Only show notifications for the current user
                if (newNotification.user_id === user.id) {
                  setNotifications(prev => [newNotification, ...prev])
                  
                  // Show toast notification
                  const displayInfo = getNotificationDisplayInfo(newNotification)
                  toast({
                    title: displayInfo.title,
                    description: displayInfo.description,
                    variant: displayInfo.variant,
                    duration: 5000, // Show for 5 seconds
                  })
                }
                break
              case 'UPDATE':
                const updatedNotification = payload.new as Notification
                
                // Only update if it's for the current user
                if (updatedNotification.user_id === user.id) {
                  setNotifications(prev => 
                    prev.map(notification => 
                      notification.id === updatedNotification.id 
                        ? updatedNotification 
                        : notification
                    )
                  )
                }
                break
              case 'DELETE':
                const deletedNotification = payload.old as Notification
                
                // Only remove if it's for the current user
                if (deletedNotification.user_id === user.id) {
                  setNotifications(prev => 
                    prev.filter(notification => notification.id !== deletedNotification.id)
                  )
                }
                break
            }
          }
        )
        .subscribe((status) => {
          console.log('Real-time subscription status:', status)
          setIsConnected(status === 'SUBSCRIBED')
          if (status === 'SUBSCRIBED') {
            setLoading(false)
          } else if (status === 'CHANNEL_ERROR') {
            setError('Failed to connect to real-time notifications')
            setLoading(false)
          }
        })

      setChannel(newChannel)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe to notifications')
      setLoading(false)
    }
  }, [supabase, user, toast])

  const unsubscribe = useCallback(() => {
    if (channel) {
      supabase.removeChannel(channel)
      setChannel(null)
      setIsConnected(false)
    }
  }, [channel, supabase])

  // Auto-subscribe when component mounts and user is available
  useEffect(() => {
    if (user) {
      subscribe()
    }

    // Cleanup on unmount
    return () => {
      unsubscribe()
    }
  }, [user, subscribe, unsubscribe])

  // Clear notifications when user changes
  useEffect(() => {
    if (!user) {
      setNotifications([])
    }
  }, [user])

  return {
    notifications,
    loading,
    error,
    isConnected,
    subscribe,
    unsubscribe
  }
}

