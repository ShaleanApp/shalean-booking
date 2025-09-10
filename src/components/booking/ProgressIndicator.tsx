"use client"

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BookingStep, BOOKING_STEPS } from '@/contexts/BookingContext'

interface ProgressIndicatorProps {
  currentStep: BookingStep
  className?: string
}

const stepLabels = {
  [BOOKING_STEPS.SERVICES]: 'Services',
  [BOOKING_STEPS.SCHEDULE]: 'Schedule',
  [BOOKING_STEPS.ADDRESS]: 'Address',
  [BOOKING_STEPS.REVIEW]: 'Review',
  [BOOKING_STEPS.PAYMENT]: 'Payment'
}

const stepOrder = Object.values(BOOKING_STEPS)

export function ProgressIndicator({ currentStep, className }: ProgressIndicatorProps) {
  const currentIndex = stepOrder.indexOf(currentStep)

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-10" />
        
        {/* Progress line */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-primary -z-10 transition-all duration-300"
          style={{ width: `${(currentIndex / (stepOrder.length - 1)) * 100}%` }}
        />

        {stepOrder.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isUpcoming = index > currentIndex

          return (
            <div key={step} className="flex flex-col items-center relative z-10">
              {/* Step circle */}
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                  {
                    "bg-primary border-primary text-primary-foreground": isCompleted || isCurrent,
                    "bg-background border-muted-foreground text-muted-foreground": isUpcoming
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Step label */}
              <span
                className={cn(
                  "mt-2 text-sm font-medium transition-colors",
                  {
                    "text-primary": isCompleted || isCurrent,
                    "text-muted-foreground": isUpcoming
                  }
                )}
              >
                {stepLabels[step]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
