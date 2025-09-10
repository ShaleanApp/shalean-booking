"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBooking } from '@/contexts/BookingContext'
import { Clock, FileText, Trash2 } from 'lucide-react'

interface DraftRestorationProps {
  onRestore?: () => void
  onDismiss?: () => void
  className?: string
}

export function DraftRestoration({ onRestore, onDismiss, className }: DraftRestorationProps) {
  const { hasDraft, getDraftAge, loadDraft, clearDraft } = useBooking()
  const [showDraft, setShowDraft] = useState(false)
  const [draftAge, setDraftAge] = useState(0)

  useEffect(() => {
    if (hasDraft()) {
      setShowDraft(true)
      setDraftAge(getDraftAge())
    }
  }, [hasDraft, getDraftAge])

  const handleRestore = () => {
    loadDraft()
    onRestore?.()
    setShowDraft(false)
  }

  const handleDismiss = () => {
    onDismiss?.()
    setShowDraft(false)
  }

  const handleClear = () => {
    clearDraft()
    setShowDraft(false)
  }

  const formatDraftAge = (hours: number) => {
    if (hours < 1) return 'just now'
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  if (!showDraft) return null

  return (
    <Card className={`border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <FileText className="w-5 h-5" />
          Saved Booking Draft
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
          <Clock className="w-4 h-4" />
          <span>Saved {formatDraftAge(draftAge)}</span>
        </div>
        
        <p className="text-sm text-amber-700 dark:text-amber-300">
          You have a saved booking draft. Would you like to continue where you left off?
        </p>

        <div className="flex gap-2">
          <Button 
            onClick={handleRestore}
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Continue Draft
          </Button>
          <Button 
            onClick={handleDismiss}
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            Start Fresh
          </Button>
          <Button 
            onClick={handleClear}
            variant="ghost"
            size="sm"
            className="text-amber-700 hover:bg-amber-100"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
