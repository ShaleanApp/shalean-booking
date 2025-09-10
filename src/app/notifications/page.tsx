'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Loader2, 
  Filter,
  Calendar,
  Clock
} from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { useRealtimeNotificationsWithToast } from '@/hooks/useRealtimeNotificationsWithToast'

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null)
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  
  const { user } = useProfile()
  const { isConnected } = useRealtimeNotificationsWithToast()
  const supabase = createClient()

  // Fetch notifications from database
  const fetchNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching notifications:', error)
        return
      }

      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      setMarkingAsRead(notificationId)
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('Error marking notification as read:', error)
        return
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    } finally {
      setMarkingAsRead(null)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return

    try {
      setMarkingAllAsRead(true)
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        return
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    } finally {
      setMarkingAllAsRead(false)
    }
  }

  // Get notification display info
  const getNotificationDisplayInfo = (notification: Notification) => {
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

  // Get variant color classes
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/10'
      case 'destructive':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10'
    }
  }

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') {
      return !notification.read
    }
    return true
  })

  // Calculate counts
  const unreadCount = notifications.filter(n => !n.read).length
  const totalCount = notifications.length

  // Fetch notifications on mount
  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Please sign in</h2>
            <p className="text-muted-foreground">You need to be signed in to view notifications.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your cleaning service notifications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Live" : "Offline"}
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({totalCount})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
        </div>
        
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={markingAllAsRead}
          >
            {markingAllAsRead ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCheck className="h-4 w-4 mr-2" />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            {filter === 'unread' ? 'Unread Notifications' : 'All Notifications'}
          </CardTitle>
          <CardDescription>
            {filter === 'unread' 
              ? `${unreadCount} unread notifications`
              : `${totalCount} total notifications`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
              <Bell className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-sm text-center">
                {filter === 'unread' 
                  ? 'You\'re all caught up!'
                  : 'You\'ll see notifications about your bookings and account here.'
                }
              </p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-1">
                {filteredNotifications.map((notification, index) => {
                  const displayInfo = getNotificationDisplayInfo(notification)
                  const variantClasses = getVariantClasses(displayInfo.variant)
                  
                  return (
                    <div key={notification.id}>
                      <div
                        className={`p-4 border-l-4 ${variantClasses} ${
                          !notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                        } hover:bg-opacity-100 transition-colors`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="text-sm font-medium text-foreground">
                                {displayInfo.title}
                              </p>
                              {!notification.read && (
                                <Badge variant="secondary" className="text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {displayInfo.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(notification.created_at).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(notification.created_at).toLocaleTimeString()}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {notification.type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              disabled={markingAsRead === notification.id}
                              className="ml-2 h-8 w-8 p-0"
                            >
                              {markingAsRead === notification.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      {index < filteredNotifications.length - 1 && <Separator />}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

