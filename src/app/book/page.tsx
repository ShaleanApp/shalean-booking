"use client"

import { BookingProvider } from '@/contexts/BookingContext'
import { MultiStepBookingForm } from '@/components/booking/MultiStepBookingForm'
import { DraftRestoration } from '@/components/booking/DraftRestoration'

export default function BookPage() {
  return (
    <BookingProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Book Your Cleaning Service
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Complete your booking in a few simple steps
            </p>
          </div>

          {/* Draft Restoration */}
          <div className="max-w-4xl mx-auto mb-6">
            <DraftRestoration />
          </div>

          {/* Multi-Step Booking Form */}
          <MultiStepBookingForm />
        </div>
      </div>
    </BookingProvider>
  )
}
