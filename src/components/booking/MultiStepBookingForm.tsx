"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressIndicator } from './ProgressIndicator'
import { useBooking, BOOKING_STEPS } from '@/contexts/BookingContext'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Import step components (to be created)
import { ServiceSelectionStep } from './steps/ServiceSelectionStep'
import { ScheduleStep } from './steps/ScheduleStep'
import { AddressStep } from './steps/AddressStep'
import { ReviewStep } from './steps/ReviewStep'
import { PaymentStep } from './steps/PaymentStep'

interface MultiStepBookingFormProps {
  className?: string
}

export function MultiStepBookingForm({ className }: MultiStepBookingFormProps) {
  const { state, nextStep, prevStep, goToStep, updateFormData } = useBooking()
  const [isValid, setIsValid] = useState(false)
  const router = useRouter()

  // Validate current step
  useEffect(() => {
    const validateCurrentStep = () => {
      switch (state.currentStep) {
        case BOOKING_STEPS.SERVICES:
          return state.formData.services.length > 0
        case BOOKING_STEPS.SCHEDULE:
          return state.formData.service_date !== '' && state.formData.service_time !== ''
        case BOOKING_STEPS.ADDRESS:
          return state.formData.address_id !== undefined || state.formData.new_address !== undefined
        case BOOKING_STEPS.REVIEW:
          return true // Review step is always valid
        case BOOKING_STEPS.PAYMENT:
          return true // Payment step validation will be handled by the payment component
        default:
          return false
      }
    }

    setIsValid(validateCurrentStep())
  }, [state.currentStep, state.formData])

  const handleNext = () => {
    if (isValid) {
      nextStep()
    }
  }

  const handlePrev = () => {
    prevStep()
  }

  const handleStepClick = (step: typeof BOOKING_STEPS[keyof typeof BOOKING_STEPS]) => {
    // Only allow navigation to previous steps or current step
    const stepOrder = Object.values(BOOKING_STEPS)
    const currentIndex = stepOrder.indexOf(state.currentStep)
    const targetIndex = stepOrder.indexOf(step)
    
    if (targetIndex <= currentIndex) {
      goToStep(step)
    }
  }

  const renderStep = () => {
    switch (state.currentStep) {
      case BOOKING_STEPS.SERVICES:
        return <ServiceSelectionStep />
      case BOOKING_STEPS.SCHEDULE:
        return <ScheduleStep />
      case BOOKING_STEPS.ADDRESS:
        return <AddressStep />
      case BOOKING_STEPS.REVIEW:
        return <ReviewStep />
      case BOOKING_STEPS.PAYMENT:
        return <PaymentStep />
      default:
        return <ServiceSelectionStep />
    }
  }

  const getStepTitle = () => {
    switch (state.currentStep) {
      case BOOKING_STEPS.SERVICES:
        return 'Select Your Services'
      case BOOKING_STEPS.SCHEDULE:
        return 'Choose Date & Time'
      case BOOKING_STEPS.ADDRESS:
        return 'Service Address'
      case BOOKING_STEPS.REVIEW:
        return 'Review Your Booking'
      case BOOKING_STEPS.PAYMENT:
        return 'Complete Payment'
      default:
        return 'Book Your Service'
    }
  }

  const getStepDescription = () => {
    switch (state.currentStep) {
      case BOOKING_STEPS.SERVICES:
        return 'Choose the cleaning services you need'
      case BOOKING_STEPS.SCHEDULE:
        return 'Select your preferred date and time'
      case BOOKING_STEPS.ADDRESS:
        return 'Where should we provide the service?'
      case BOOKING_STEPS.REVIEW:
        return 'Please review your booking details'
      case BOOKING_STEPS.PAYMENT:
        return 'Secure payment processing'
      default:
        return 'Complete your booking in a few simple steps'
    }
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress Indicator */}
      <div className="mb-8">
        <ProgressIndicator currentStep={state.currentStep} />
      </div>

      {/* Main Form Card */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
          <p className="text-muted-foreground">{getStepDescription()}</p>
        </CardHeader>
        <CardContent>
          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={state.currentStep === BOOKING_STEPS.SERVICES}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {state.currentStep === BOOKING_STEPS.PAYMENT ? (
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                >
                  Complete Later
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isValid || state.isLoading}
                  className="flex items-center gap-2"
                >
                  {state.currentStep === BOOKING_STEPS.REVIEW ? 'Proceed to Payment' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Error Display */}
          {state.error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive text-sm">{state.error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
