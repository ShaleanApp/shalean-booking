"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'card' | 'inline' | 'overlay'
  className?: string
}

export function LoadingState({ 
  message = 'Loading...', 
  size = 'md',
  variant = 'default',
  className 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const iconSize = sizeClasses[size]

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Loader2 className={cn(iconSize, 'animate-spin')} />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    )
  }

  if (variant === 'overlay') {
    return (
      <div className={cn('fixed inset-0 bg-black/50 flex items-center justify-center z-50', className)}>
        <Card className="w-80">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className={cn(iconSize, 'animate-spin')} />
              <p className="text-sm text-muted-foreground text-center">{message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className={cn(iconSize, 'animate-spin')} />
            {message}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please wait while we process your request...
          </p>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <div className={cn('flex flex-col items-center justify-center p-8', className)}>
      <Loader2 className={cn(iconSize, 'animate-spin mb-4')} />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

interface LoadingButtonProps {
  loading: boolean
  children: React.ReactNode
  loadingText?: string
  disabled?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function LoadingButton({ 
  loading, 
  children, 
  loadingText = 'Loading...',
  disabled,
  className,
  onClick,
  type = 'button'
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {loading ? loadingText : children}
    </button>
  )
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <Loader2 className={cn(sizeClasses[size], 'animate-spin', className)} />
  )
}

interface RetryButtonProps {
  onRetry: () => void
  loading?: boolean
  error?: string
  className?: string
}

export function RetryButton({ onRetry, loading = false, error, className }: RetryButtonProps) {
  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
      <button
        onClick={onRetry}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        {loading ? 'Retrying...' : 'Try Again'}
      </button>
    </div>
  )
}

interface SkeletonProps {
  className?: string
  lines?: number
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  if (lines === 1) {
    return (
      <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
    )
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse bg-gray-200 rounded',
            i === lines - 1 ? 'w-3/4' : 'w-full',
            className
          )}
        />
      ))}
    </div>
  )
}

interface LoadingCardProps {
  title?: string
  description?: string
  className?: string
}

export function LoadingCard({ title, description, className }: LoadingCardProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
        </div>
      </CardHeader>
      <CardContent>
        {description && (
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        )}
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </CardContent>
    </Card>
  )
}
