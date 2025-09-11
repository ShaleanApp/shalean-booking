'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: any
  tag?: string
  requireInteraction?: boolean
}

class PushNotificationService {
  private vapidPublicKey: string
  private supabase: any

  constructor() {
    // Only initialize on client side
    if (typeof window === 'undefined') {
      throw new Error('PushNotificationService can only be used on the client side')
    }
    
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
    this.supabase = createClient()
  }

  // Check if push notifications are supported
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window
  }

  // Check if notifications are permitted
  async isPermissionGranted(): Promise<boolean> {
    if (!this.isSupported()) return false
    
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  // Register for push notifications
  async register(): Promise<PushSubscription | null> {
    if (!this.isSupported()) {
      console.warn('Push notifications are not supported in this browser')
      return null
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        console.warn('Push notification permission denied')
        return null
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey) as BufferSource
      })

      // Save subscription to database
      await this.saveSubscription(subscription)

      console.log('Push notification subscription successful')
      return subscription as any
    } catch (error) {
      console.error('Error registering for push notifications:', error)
      return null
    }
  }

  // Unregister from push notifications
  async unregister(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          await subscription.unsubscribe()
          await this.removeSubscription(subscription)
        }
      }
    } catch (error) {
      console.error('Error unregistering from push notifications:', error)
    }
  }

  // Send a test notification
  async sendTestNotification(): Promise<void> {
    if (!this.isSupported()) return

    const registration = await navigator.serviceWorker.ready
    registration.showNotification('Test Notification', {
      body: 'This is a test push notification from Shalean Cleaning Services',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'test-notification',
      requireInteraction: true
    })
  }

  // Save subscription to database
  private async saveSubscription(subscription: any): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return

      const { error } = await this.supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh_key: (subscription as any).keys?.p256dh,
          auth_key: (subscription as any).keys?.auth,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving push subscription:', error)
      }
    } catch (error) {
      console.error('Error saving push subscription:', error)
    }
  }

  // Remove subscription from database
  private async removeSubscription(subscription: any): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return

      const { error } = await this.supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', subscription.endpoint)

      if (error) {
        console.error('Error removing push subscription:', error)
      }
    } catch (error) {
      console.error('Error removing push subscription:', error)
    }
  }

  // Convert VAPID key to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
}

// Create singleton instance only on client side
export const pushNotificationService = typeof window !== 'undefined' 
  ? new PushNotificationService() 
  : null

// Hook for using push notifications
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !pushNotificationService) {
      return
    }

    setIsSupported(pushNotificationService.isSupported())
    
    // Check if already registered
    if (pushNotificationService.isSupported()) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setIsRegistered(!!subscription)
        })
      })
    }
  }, [])

  const register = async () => {
    if (!pushNotificationService) return
    
    setIsLoading(true)
    try {
      const subscription = await pushNotificationService.register()
      setIsRegistered(!!subscription)
    } catch (error) {
      console.error('Error registering for push notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const unregister = async () => {
    if (!pushNotificationService) return
    
    setIsLoading(true)
    try {
      await pushNotificationService.unregister()
      setIsRegistered(false)
    } catch (error) {
      console.error('Error unregistering from push notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendTest = async () => {
    if (!pushNotificationService) return
    await pushNotificationService.sendTestNotification()
  }

  return {
    isSupported,
    isRegistered,
    isLoading,
    register,
    unregister,
    sendTest
  }
}
