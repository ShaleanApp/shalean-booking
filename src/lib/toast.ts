/**
 * Toast notification system
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface ToastOptions {
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

class ToastManager {
  private toasts: Toast[] = []
  private listeners: ((toasts: Toast[]) => void)[] = []

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]))
  }

  private addToast(toast: Omit<Toast, 'id'>) {
    const id = this.generateId()
    const newToast: Toast = {
      id,
      duration: 5000, // Default 5 seconds
      ...toast,
    }

    this.toasts.push(newToast)
    this.notify()

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.removeToast(id)
      }, newToast.duration)
    }

    return id
  }

  success(title: string, description?: string, options?: ToastOptions) {
    return this.addToast({
      type: 'success',
      title,
      description,
      ...options,
    })
  }

  error(title: string, description?: string, options?: ToastOptions) {
    return this.addToast({
      type: 'error',
      title,
      description,
      duration: 8000, // Errors stay longer
      ...options,
    })
  }

  warning(title: string, description?: string, options?: ToastOptions) {
    return this.addToast({
      type: 'warning',
      title,
      description,
      ...options,
    })
  }

  info(title: string, description?: string, options?: ToastOptions) {
    return this.addToast({
      type: 'info',
      title,
      description,
      ...options,
    })
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
    this.notify()
  }

  clear() {
    this.toasts = []
    this.notify()
  }

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  getToasts(): Toast[] {
    return [...this.toasts]
  }
}

// Global toast manager instance
export const toast = new ToastManager()

// Convenience functions
export const showSuccess = (title: string, description?: string, options?: ToastOptions) =>
  toast.success(title, description, options)

export const showError = (title: string, description?: string, options?: ToastOptions) =>
  toast.error(title, description, options)

export const showWarning = (title: string, description?: string, options?: ToastOptions) =>
  toast.warning(title, description, options)

export const showInfo = (title: string, description?: string, options?: ToastOptions) =>
  toast.info(title, description, options)

// API error toast helper
export const showApiError = (error: any, context?: string) => {
  let title = 'Error'
  let description = 'Something went wrong'

  if (error?.response?.data?.message) {
    description = error.response.data.message
  } else if (error?.message) {
    description = error.message
  }

  if (context) {
    title = `${context} Error`
  }

  return toast.error(title, description, {
    duration: 10000, // API errors stay longer
  })
}

// Success helpers for common actions
export const showBookingSuccess = (bookingId: string) =>
  toast.success('Booking Confirmed!', `Your booking #${bookingId} has been created successfully.`)

export const showPaymentSuccess = (amount: string) =>
  toast.success('Payment Successful!', `Payment of ${amount} has been processed successfully.`)

export const showProfileUpdateSuccess = () =>
  toast.success('Profile Updated', 'Your profile has been updated successfully.')

export const showAddressAddedSuccess = () =>
  toast.success('Address Added', 'Your new address has been added successfully.')

export const showServiceBookedSuccess = (serviceName: string) =>
  toast.success('Service Booked', `${serviceName} has been booked successfully.`)
