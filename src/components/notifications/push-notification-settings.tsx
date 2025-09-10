'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bell, BellOff, Loader2, Smartphone, CheckCircle, XCircle } from 'lucide-react'
import { usePushNotifications } from '@/lib/push-notifications'

export function PushNotificationSettings() {
  const { isSupported, isRegistered, isLoading, register, unregister, sendTest } = usePushNotifications()
  const [testing, setTesting] = useState(false)

  const handleToggle = async () => {
    if (isRegistered) {
      await unregister()
    } else {
      await register()
    }
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      await sendTest()
    } catch (error) {
      console.error('Error sending test notification:', error)
    } finally {
      setTesting(false)
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BellOff className="h-5 w-5 mr-2" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in this browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive notifications on your device even when the app is not open
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Enable Push Notifications</p>
              {isRegistered && (
                <Badge variant="default" className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Get notified about booking updates, cleaner assignments, and payment confirmations
            </p>
          </div>
          <Switch
            checked={isRegistered}
            onCheckedChange={handleToggle}
            disabled={isLoading}
          />
        </div>

        {isRegistered && (
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Push notifications are enabled. You'll receive notifications for important updates.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Test Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Send a test notification to verify everything is working
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={testing}
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Smartphone className="h-4 w-4 mr-2" />
                )}
                Send Test
              </Button>
            </div>
          </div>
        )}

        {!isRegistered && (
          <Alert>
            <BellOff className="h-4 w-4" />
            <AlertDescription>
              Enable push notifications to stay updated with your cleaning service bookings.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
