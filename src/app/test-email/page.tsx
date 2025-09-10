'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [status, setStatus] = useState('confirmed');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testBookingConfirmation = async () => {
    if (!email) {
      setResult('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'confirmation',
          bookingId: 'TEST-123',
          customerEmail: email,
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testBookingReminder = async () => {
    if (!email) {
      setResult('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'reminder',
          bookingId: 'TEST-123',
          customerEmail: email,
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testStatusUpdate = async () => {
    if (!email || !bookingId) {
      setResult('Please enter an email address and booking ID');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/email/status-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          status,
          statusMessage: statusMessage || `Your booking status has been updated to ${status}`,
          cleanerName: 'John Doe',
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testReminderCron = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your-secret-token',
        },
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Email Testing Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Email Address</CardTitle>
            <CardDescription>Enter an email address to test email functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Confirmation Email</CardTitle>
            <CardDescription>Test the booking confirmation email template</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testBookingConfirmation} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Confirmation Email'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Reminder Email</CardTitle>
            <CardDescription>Test the booking reminder email template</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testBookingReminder} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Reminder Email'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Update Email</CardTitle>
            <CardDescription>Test the booking status update email template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bookingId">Booking ID</Label>
              <Input
                id="bookingId"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="TEST-123"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_my_way">On My Way</SelectItem>
                  <SelectItem value="arrived">Arrived</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="statusMessage">Status Message</Label>
              <Textarea
                id="statusMessage"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                placeholder="Custom status message..."
              />
            </div>
            <Button 
              onClick={testStatusUpdate} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Status Update Email'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reminder Cron Job</CardTitle>
            <CardDescription>Test the reminder email cron job functionality</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testReminderCron} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Test Reminder Cron Job'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {result}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
