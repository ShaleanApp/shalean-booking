"use client"

import dynamic from 'next/dynamic'
import { LoadingState } from '@/components/shared/LoadingState'

// Lazy load heavy booking components
export const LazyMultiStepBookingForm = dynamic(
  () => import('./MultiStepBookingForm').then(mod => ({ default: mod.MultiStepBookingForm })),
  {
    loading: () => <LoadingState message="Loading booking form..." variant="card" />,
    ssr: false
  }
)

export const LazyBookingConfirmation = dynamic(
  () => import('./BookingConfirmation').then(mod => ({ default: mod.BookingConfirmation })),
  {
    loading: () => <LoadingState message="Loading confirmation..." variant="card" />,
    ssr: false
  }
)

// Lazy load booking steps
export const LazyServiceSelectionStep = dynamic(
  () => import('./steps/ServiceSelectionStep').then(mod => ({ default: mod.ServiceSelectionStep })),
  {
    loading: () => <LoadingState message="Loading services..." variant="inline" />,
    ssr: false
  }
)

export const LazyScheduleStep = dynamic(
  () => import('./steps/ScheduleStep').then(mod => ({ default: mod.ScheduleStep })),
  {
    loading: () => <LoadingState message="Loading schedule..." variant="inline" />,
    ssr: false
  }
)

export const LazyAddressStep = dynamic(
  () => import('./steps/AddressStep').then(mod => ({ default: mod.AddressStep })),
  {
    loading: () => <LoadingState message="Loading addresses..." variant="inline" />,
    ssr: false
  }
)

export const LazyReviewStep = dynamic(
  () => import('./steps/ReviewStep').then(mod => ({ default: mod.ReviewStep })),
  {
    loading: () => <LoadingState message="Loading review..." variant="inline" />,
    ssr: false
  }
)

export const LazyPaymentStep = dynamic(
  () => import('./steps/PaymentStep').then(mod => ({ default: mod.PaymentStep })),
  {
    loading: () => <LoadingState message="Loading payment..." variant="inline" />,
    ssr: false
  }
)

