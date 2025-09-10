'use client'

import { useRealtimeNotificationsWithToast } from '@/hooks/useRealtimeNotificationsWithToast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Wifi, WifiOff, TestTube } from 'lucide-react'
import { useState } from 'react'

export default function TestRealtimePage() {
  const { 
    notifications, 
    loading, 
    error, 
    isConnected, 
    subscribe, 
    unsubscribe 
  } = useRealtimeNotificationsWithToast()

  const [testingTriggers, setTestingTriggers] = useState(false)
  const [triggerResults, setTriggerResults] = useState<any>(null)

  const testNotificationTriggers = async () => {
    try {
      setTestingTriggers(true)
      const response = await fetch('/api/test-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      setTriggerResults(data)
    } catch (error) {
      console.error('Error testing triggers:', error)
      setTriggerResults({ error: 'Failed to test triggers' })
    } finally {
      setTestingTriggers(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Real-time Notifications Test</h1>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="default" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Disconnected
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>
              Monitor real-time connection status and controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={subscribe} 
                disabled={loading || isConnected}
                className="flex items-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Subscribe
              </Button>
              <Button 
                onClick={unsubscribe} 
                disabled={!isConnected}
                variant="outline"
              >
                Unsubscribe
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Notification Triggers</CardTitle>
            <CardDescription>
              Test database triggers that generate notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testNotificationTriggers}
              disabled={testingTriggers}
              className="flex items-center gap-2"
            >
              {testingTriggers && <Loader2 className="h-4 w-4 animate-spin" />}
              <TestTube className="h-4 w-4" />
              Test Triggers
            </Button>
            
            {triggerResults && (
              <div className="space-y-2">
                {triggerResults.error ? (
                  <Alert variant="destructive">
                    <AlertDescription>{triggerResults.error}</AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertDescription>
                      Generated {triggerResults.count} notifications
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications ({notifications.length})</CardTitle>
            <CardDescription>
              Real-time notifications from the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No notifications received yet. Try inserting a record in the notifications table.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="p-3 border rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{notification.type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{notification.channel}</p>
                    <p className="text-xs text-muted-foreground">
                      Status: {notification.status}
                    </p>
                    {notification.payload && (
                      <pre className="text-xs mt-2 p-2 bg-background rounded border">
                        {JSON.stringify(notification.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
          <CardDescription>
            How to test the real-time functionality with toast notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            1. Make sure you're logged in and subscribed to the real-time channel
          </p>
          <p className="text-sm">
            2. Click "Test Triggers" to generate sample notifications
          </p>
          <p className="text-sm">
            3. Watch for toast notifications appearing in the top-right corner
          </p>
          <p className="text-sm">
            4. Check the notifications list below to see all received notifications
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Toast notifications will only appear for notifications 
            that belong to the currently logged-in user. The system automatically filters 
            notifications by user ID.
          </p>
          <p className="text-sm text-muted-foreground">
            Example SQL to insert a test notification (replace with your user ID):
          </p>
          <pre className="text-xs p-2 bg-muted rounded border">
{`INSERT INTO notifications (user_id, channel, type, status, payload)
VALUES (
  'your-user-id',
  'email',
  'booking_confirmed',
  'pending',
  '{"service_date": "2024-12-10", "service_time": "10:00"}'
);`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
