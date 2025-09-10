'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookingHistory } from '@/components/customer/BookingHistory'
import { PaymentHistory } from '@/components/customer/PaymentHistory'
import { AddressManagement } from '@/components/customer/AddressManagement'
import { ProfileManagement } from '@/components/customer/ProfileManagement'
import { useCustomerStats } from '@/hooks/useCustomerStats'

export default function TestCustomerDashboardPage() {
  const [activeComponent, setActiveComponent] = useState('stats')
  const { stats, isLoading } = useCustomerStats()

  const components = {
    stats: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Customer Stats Test</h2>
        {isLoading ? (
          <p>Loading stats...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.upcomingBookings || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{stats?.totalSpent?.toLocaleString() || '0'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Completed Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.completedServices || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Saved Addresses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.savedAddresses || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    ),
    bookings: <BookingHistory />,
    payments: <PaymentHistory />,
    addresses: <AddressManagement />,
    profile: <ProfileManagement />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Customer Dashboard Test Page</h1>
        
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {Object.keys(components).map((key) => (
              <Button
                key={key}
                variant={activeComponent === key ? 'default' : 'outline'}
                onClick={() => setActiveComponent(key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {components[activeComponent as keyof typeof components]}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
