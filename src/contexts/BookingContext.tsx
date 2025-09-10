"use client"

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { BookingFormData } from '@/types'

// Define the booking steps
export const BOOKING_STEPS = {
  SERVICES: 'services',
  SCHEDULE: 'schedule', 
  ADDRESS: 'address',
  REVIEW: 'review',
  PAYMENT: 'payment'
} as const

export type BookingStep = typeof BOOKING_STEPS[keyof typeof BOOKING_STEPS]

// Define the booking state
interface BookingState {
  currentStep: BookingStep
  formData: BookingFormData
  isGuest: boolean
  isLoading: boolean
  error: string | null
}

// Define the booking actions
type BookingAction =
  | { type: 'SET_STEP'; payload: BookingStep }
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<BookingFormData> }
  | { type: 'SET_GUEST'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_BOOKING' }
  | { type: 'LOAD_DRAFT'; payload: BookingFormData }

// Initial state
const initialState: BookingState = {
  currentStep: BOOKING_STEPS.SERVICES,
  formData: {
    services: [],
    extras: [],
    service_date: '',
    service_time: '',
    notes: '',
    frequency: 'once'
  },
  isGuest: true,
  isLoading: false,
  error: null
}

// Reducer function
function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload, error: null }
    
    case 'UPDATE_FORM_DATA':
      return { 
        ...state, 
        formData: { ...state.formData, ...action.payload },
        error: null 
      }
    
    case 'SET_GUEST':
      return { ...state, isGuest: action.payload }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    
    case 'RESET_BOOKING':
      return initialState
    
    case 'LOAD_DRAFT':
      return { ...state, formData: action.payload, error: null }
    
    default:
      return state
  }
}

// Context type
interface BookingContextType {
  state: BookingState
  dispatch: React.Dispatch<BookingAction>
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: BookingStep) => void
  updateFormData: (data: Partial<BookingFormData>) => void
  saveDraft: () => void
  loadDraft: () => void
  clearDraft: () => void
  hasDraft: () => boolean
  getDraftAge: () => number
}

// Create context
const BookingContext = createContext<BookingContextType | undefined>(undefined)

// Provider component
export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState)

  // Load draft on mount for guests
  useEffect(() => {
    if (state.isGuest) {
      loadDraft()
    }
  }, [state.isGuest])

  // Save draft whenever form data changes for guests
  useEffect(() => {
    if (state.isGuest && state.formData.services.length > 0) {
      saveDraft()
    }
  }, [state.formData, state.isGuest])

  const nextStep = () => {
    const stepOrder = Object.values(BOOKING_STEPS)
    const currentIndex = stepOrder.indexOf(state.currentStep)
    if (currentIndex < stepOrder.length - 1) {
      dispatch({ type: 'SET_STEP', payload: stepOrder[currentIndex + 1] })
    }
  }

  const prevStep = () => {
    const stepOrder = Object.values(BOOKING_STEPS)
    const currentIndex = stepOrder.indexOf(state.currentStep)
    if (currentIndex > 0) {
      dispatch({ type: 'SET_STEP', payload: stepOrder[currentIndex - 1] })
    }
  }

  const goToStep = (step: BookingStep) => {
    dispatch({ type: 'SET_STEP', payload: step })
  }

  const updateFormData = (data: Partial<BookingFormData>) => {
    dispatch({ type: 'UPDATE_FORM_DATA', payload: data })
  }

  const saveDraft = () => {
    if (typeof window !== 'undefined' && state.isGuest) {
      try {
        const draftData = {
          ...state.formData,
          savedAt: new Date().toISOString(),
          version: '1.0'
        }
        localStorage.setItem('booking-draft', JSON.stringify(draftData))
        console.log('Booking draft saved successfully')
      } catch (error) {
        console.error('Failed to save booking draft:', error)
      }
    }
  }

  const loadDraft = () => {
    if (typeof window !== 'undefined') {
      try {
        const draft = localStorage.getItem('booking-draft')
        if (draft) {
          const parsedDraft = JSON.parse(draft)
          // Validate draft data structure
          if (parsedDraft.services && Array.isArray(parsedDraft.services)) {
            dispatch({ type: 'LOAD_DRAFT', payload: parsedDraft })
            console.log('Booking draft loaded successfully')
          } else {
            console.warn('Invalid draft data structure, clearing draft')
            clearDraft()
          }
        }
      } catch (error) {
        console.error('Failed to load booking draft:', error)
        clearDraft()
      }
    }
  }

  const clearDraft = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('booking-draft')
        dispatch({ type: 'RESET_BOOKING' })
        console.log('Booking draft cleared successfully')
      } catch (error) {
        console.error('Failed to clear booking draft:', error)
      }
    }
  }

  const hasDraft = () => {
    if (typeof window !== 'undefined') {
      try {
        const draft = localStorage.getItem('booking-draft')
        return draft !== null
      } catch (error) {
        return false
      }
    }
    return false
  }

  const getDraftAge = () => {
    if (typeof window !== 'undefined') {
      try {
        const draft = localStorage.getItem('booking-draft')
        if (draft) {
          const parsedDraft = JSON.parse(draft)
          if (parsedDraft.savedAt) {
            const savedAt = new Date(parsedDraft.savedAt)
            const now = new Date()
            const diffInHours = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60)
            return Math.floor(diffInHours)
          }
        }
      } catch (error) {
        console.error('Failed to get draft age:', error)
      }
    }
    return 0
  }

  const value: BookingContextType = {
    state,
    dispatch,
    nextStep,
    prevStep,
    goToStep,
    updateFormData,
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
    getDraftAge
  }

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  )
}

// Hook to use the booking context
export function useBooking() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}
