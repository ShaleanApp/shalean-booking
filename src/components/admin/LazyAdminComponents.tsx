"use client"

import dynamic from 'next/dynamic'
import { LoadingState } from '@/components/shared/LoadingState'

// Lazy load admin components
export const LazyAnalyticsPage = dynamic(
  () => import('@/app/admin/analytics/page'),
  {
    loading: () => <LoadingState message="Loading analytics..." variant="card" />,
    ssr: false
  }
)

export const LazyBookingsPage = dynamic(
  () => import('@/app/admin/bookings/page'),
  {
    loading: () => <LoadingState message="Loading bookings..." variant="card" />,
    ssr: false
  }
)

export const LazyCleanersPage = dynamic(
  () => import('@/app/admin/cleaners/page'),
  {
    loading: () => <LoadingState message="Loading cleaners..." variant="card" />,
    ssr: false
  }
)

export const LazyEmailMonitoringPage = dynamic(
  () => import('@/app/admin/email-monitoring/page'),
  {
    loading: () => <LoadingState message="Loading email monitoring..." variant="card" />,
    ssr: false
  }
)

export const LazyPaymentsPage = dynamic(
  () => import('@/app/admin/payments/page'),
  {
    loading: () => <LoadingState message="Loading payments..." variant="card" />,
    ssr: false
  }
)

export const LazyServicesPage = dynamic(
  () => import('@/app/admin/services/page'),
  {
    loading: () => <LoadingState message="Loading services..." variant="card" />,
    ssr: false
  }
)

export const LazyUsersPage = dynamic(
  () => import('@/app/admin/users/page'),
  {
    loading: () => <LoadingState message="Loading users..." variant="card" />,
    ssr: false
  }
)

