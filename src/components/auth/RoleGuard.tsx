'use client'

import { useProfile } from '@/hooks/useProfile'
import { ReactNode } from 'react'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: ('customer' | 'cleaner' | 'admin')[]
  fallback?: ReactNode
  requireAuth?: boolean
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback = null, 
  requireAuth = true 
}: RoleGuardProps) {
  const { user, profile, loading } = useProfile()

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // If auth is required but user is not logged in
  if (requireAuth && !user) {
    return fallback || (
      <div className="text-center p-4">
        <p className="text-gray-600">Please sign in to access this content.</p>
      </div>
    )
  }

  // If user is logged in but no profile (shouldn't happen with our trigger)
  if (requireAuth && user && !profile) {
    return fallback || (
      <div className="text-center p-4">
        <p className="text-gray-600">Profile not found. Please contact support.</p>
      </div>
    )
  }

  // Check if user's role is allowed
  if (profile && !allowedRoles.includes(profile.role)) {
    return fallback || (
      <div className="text-center p-4">
        <p className="text-gray-600">You don't have permission to access this content.</p>
      </div>
    )
  }

  return <>{children}</>
}

// Convenience components for specific roles
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function CleanerOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['cleaner']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function CustomerOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['customer']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function AdminOrCleaner({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin', 'cleaner']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}
