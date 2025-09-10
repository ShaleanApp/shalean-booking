"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBooking } from '@/contexts/BookingContext'
import { PaystackPayment } from '@/components/payment/PaystackPayment'
import { createClient } from '@/lib/supabase/client'
import { nairaToKobo, formatCurrency } from '@/lib/payment'
import { CreditCard, Shield, CheckCircle, Loader2 } from 'lucide-react'

export function PaymentStep() {
  const { state, clearDraft } = useBooking()
  const [isCreatingBooking, setIsCreatingBooking] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [bookingData, setBookingData] = useState<{ id: string; reference: string } | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  // Calculate total amount
  const calculateTotal = () => {
    let total = 0

    // Calculate services total
    state.formData.services.forEach(serviceData => {
      // This would need to fetch service details from Supabase
      // For now, using a placeholder calculation
      total += 50 * serviceData.quantity // Placeholder price
    })

    // Calculate extras total
    state.formData.extras.forEach(extraData => {
      // This would need to fetch extra details from Supabase
      // For now, using a placeholder calculation
      total += 25 * extraData.quantity // Placeholder price
    })

    return total
  }

  const handleCreateBooking = async () => {
    setIsCreatingBooking(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: state.formData,
          isGuest: state.isGuest
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create booking')
      }

      setBookingData({
        id: data.booking.id,
        reference: data.booking.payment_reference
      })
      setPaymentStatus('processing')

    } catch (error) {
      console.error('Booking creation error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create booking')
      setPaymentStatus('error')
    } finally {
      setIsCreatingBooking(false)
    }
  }

  const handlePaymentSuccess = (response: any) => {
    console.log('Payment successful:', response)
    setPaymentStatus('success')
    
    // Clear draft after successful payment
    clearDraft()
    
    // Redirect to confirmation page after a short delay
    setTimeout(() => {
      router.push(`/booking/confirmation?booking=${bookingData?.id}`)
    }, 2000)
  }

  const handlePaymentClose = () => {
    console.log('Payment modal closed')
    setPaymentStatus('idle')
  }

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error)
    setErrorMessage('Payment failed. Please try again.')
    setPaymentStatus('error')
  }

  // Get user email for payment
  const [userEmail, setUserEmail] = useState('')
  
  useEffect(() => {
    const getUserEmail = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email || '')
    }
    getUserEmail()
  }, [])

  if (paymentStatus === 'success') {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h3>
          <p className="text-muted-foreground">
            Your booking has been confirmed. Redirecting to confirmation page...
          </p>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'error') {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Payment Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                {errorMessage || 'Something went wrong. Please try again.'}
              </p>
              <Button 
                onClick={() => {
                  setPaymentStatus('idle')
                  setErrorMessage('')
                  setBookingData(null)
                }}
                variant="outline"
                size="sm"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentStatus === 'processing' && bookingData) {
    return (
      <div className="space-y-6">
        <PaystackPayment
          amount={nairaToKobo(calculateTotal())}
          email={userEmail}
          reference={bookingData.reference}
          onSuccess={handlePaymentSuccess}
          onClose={handlePaymentClose}
          onError={handlePaymentError}
          metadata={{
            booking_id: bookingData.id,
            user_id: state.isGuest ? 'guest' : 'authenticated'
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-primary" />
                <div>
                  <h4 className="font-medium">Credit/Debit Card</h4>
                  <p className="text-sm text-muted-foreground">
                    Secure payment powered by Paystack
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Your payment information is encrypted and secure</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₦0.00</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Button */}
      <Button
        onClick={handleCreateBooking}
        disabled={isCreatingBooking || !userEmail}
        size="lg"
        className="w-full"
      >
        {isCreatingBooking ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Booking...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay {formatCurrency(calculateTotal())}
          </>
        )}
      </Button>

      {!userEmail && (
        <div className="text-center text-sm text-muted-foreground">
          <p>Please sign in to complete your payment</p>
        </div>
      )}

      {/* Security Notice */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          By proceeding with payment, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  )
}
