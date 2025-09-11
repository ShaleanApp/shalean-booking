'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/browser'
import { RealtimeChannel } from '@supabase/supabase-js'

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
}

interface UseRealtimeNotificationsReturn {
  notifications: Notification[]
  loading: boolean
  error: string | null
  isConnected: boolean
  subscribe: () => void
  unsubscribe: () => void
}

export function useRealtimeNotifications(): UseRealtimeNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  
  const supabase = createSupabaseBrowser()

  const subscribe = useCallback(() => {
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
                setNotifications(prev => [payload.new as Notification, ...prev])
                break
              case 'UPDATE':
                setNotifications(prev => 
                  prev.map(notification => 
                    notification.id === payload.new.id 
                      ? payload.new as Notification 
                      : notification
                  )
                )
                break
              case 'DELETE':
                setNotifications(prev => 
                  prev.filter(notification => notification.id !== payload.old.id)
                )
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
  }, [supabase])

  const unsubscribe = useCallback(() => {
    if (channel) {
      supabase.removeChannel(channel)
      setChannel(null)
      setIsConnected(false)
    }
  }, [channel, supabase])

  // Auto-subscribe when component mounts
  useEffect(() => {
    subscribe()

    // Cleanup on unmount
    return () => {
      unsubscribe()
    }
  }, [subscribe, unsubscribe])

  return {
    notifications,
    loading,
    error,
    isConnected,
    subscribe,
    unsubscribe
  }
}

