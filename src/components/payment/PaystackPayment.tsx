"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react'
// Import PaystackPop directly - it's safe to use in client components
import PaystackPop from '@paystack/inline-js'

interface PaystackPaymentProps {
  amount: number // Amount in kobo (e.g., 500000 for NGN 5000.00)
  email: string
  reference: string
  onSuccess: (response: any) => void
  onClose: () => void
  onError?: (error: any) => void
  metadata?: Record<string, any>
  className?: string
}

export function PaystackPayment({
  amount,
  email,
  reference,
  onSuccess,
  onClose,
  onError,
  metadata = {},
  className
}: PaystackPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const config = {
    reference: reference,
    email: email,
    amount: amount, // amount in kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    metadata: {
      ...metadata,
      custom_fields: [
        {
          display_name: "Booking Reference",
          variable_name: "booking_reference",
          value: reference,
        },
      ],
    },
  }

  const handlePayment = async () => {
    if (!isClient) return
    
    setIsLoading(true)
    setPaymentStatus('processing')
    setErrorMessage('')

    try {
      const PaystackPopModule = await import('@paystack/inline-js')
      const PaystackPop = PaystackPopModule.default
      
      const paystack = PaystackPop.setup({
        ...config,
        onSuccess: (response: any) => {
          setPaymentStatus('success')
          setIsLoading(false)
          onSuccess(response)
        },
        onCancel: () => {
          setPaymentStatus('idle')
          setIsLoading(false)
          onClose()
        },
        onClose: () => {
          setPaymentStatus('idle')
          setIsLoading(false)
          onClose()
        }
      })
      
      paystack.openIframe()
    } catch (error) {
      console.error('Payment initialization error:', error)
      setPaymentStatus('error')
      setErrorMessage('Failed to initialize payment. Please try again.')
      setIsLoading(false)
      onError?.(error)
    }
  }

  const formatAmount = (amountInKobo: number) => {
    return (amountInKobo / 100).toLocaleString('en-NG', {
      style: 'currency',
      currency: 'NGN'
    })
  }

  if (paymentStatus === 'success') {
    return (
      <Card className={`border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                Payment Successful!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your payment has been processed successfully.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (paymentStatus === 'error') {
    return (
      <Card className={`border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Payment Failed
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                {errorMessage || 'Payment could not be processed. Please try again.'}
              </p>
            </div>
            <Button 
              onClick={() => {
                setPaymentStatus('idle')
                setErrorMessage('')
              }}
              variant="outline"
              size="sm"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Complete Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {formatAmount(amount)}
          </div>
          <p className="text-sm text-muted-foreground">
            Secure payment powered by Paystack
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Email:</span>
            <span className="font-medium">{email}</span>
          </div>
          <div className="flex justify-between">
            <span>Reference:</span>
            <span className="font-mono text-xs">{reference}</span>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={isLoading || !isClient}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : !isClient ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay {formatAmount(amount)}
            </>
          )}
        </Button>

        <div className="text-center text-xs text-muted-foreground">
          <p>Your payment information is encrypted and secure</p>
        </div>
      </CardContent>
    </Card>
  )
}
