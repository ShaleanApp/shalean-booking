"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBooking } from '@/contexts/BookingContext'
import { Calendar, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ScheduleStep() {
  const { state, updateFormData } = useBooking()
  const [selectedDate, setSelectedDate] = useState(state.formData.service_date)
  const [selectedTime, setSelectedTime] = useState(state.formData.service_time)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])

  // Available time slots (in a real app, this would come from the backend)
  const allTimeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ]

  // Mock unavailable times (in a real app, this would come from the backend)
  const getUnavailableTimes = (date: string) => {
    // Simulate some unavailable times based on date
    const dayOfWeek = new Date(date).getDay()
    const unavailableTimes: string[] = []
    
    // Weekend restrictions
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      unavailableTimes.push('08:00', '08:30', '18:00', '17:30')
    }
    
    // Add some random unavailable times for demo
    if (date === '2024-01-15') {
      unavailableTimes.push('10:00', '10:30', '14:00', '14:30')
    }
    
    return unavailableTimes
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    updateFormData({ service_date: date })
    
    // Reset time selection when date changes
    if (selectedTime) {
      setSelectedTime('')
      updateFormData({ service_time: '' })
    }
    
    // Update available times for the selected date
    const unavailable = getUnavailableTimes(date)
    setAvailableTimes(allTimeSlots.filter(time => !unavailable.includes(time)))
  }

  const handleTimeChange = (time: string) => {
    setSelectedTime(time)
    updateFormData({ service_time: time })
  }

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  // Get maximum date (3 months from now)
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3)
  const maxDateString = maxDate.toISOString().split('T')[0]

  // Initialize available times when component mounts
  useEffect(() => {
    if (selectedDate) {
      const unavailable = getUnavailableTimes(selectedDate)
      setAvailableTimes(allTimeSlots.filter(time => !unavailable.includes(time)))
    }
  }, [selectedDate])

  const isTimeUnavailable = (time: string) => {
    return !availableTimes.includes(time)
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={minDate}
              max={maxDateString}
              className="w-full p-3 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-sm text-muted-foreground">
              Select a date between tomorrow and 3 months from now
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Time Selection */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Select Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {allTimeSlots.map((time) => {
                  const isUnavailable = isTimeUnavailable(time)
                  const isSelected = selectedTime === time
                  
                  return (
                    <Button
                      key={time}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => !isUnavailable && handleTimeChange(time)}
                      disabled={isUnavailable}
                      className={cn(
                        "w-full",
                        isUnavailable && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {formatTime(time)}
                    </Button>
                  )
                })}
              </div>
              
              {availableTimes.length === 0 && (
                <div className="flex items-center gap-2 p-4 bg-muted rounded-md">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No available time slots for this date. Please select a different date.
                  </p>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                Available time slots are shown above. Unavailable times are disabled.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Summary */}
      {selectedDate && selectedTime && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Selected Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">{formatTime(selectedTime)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
