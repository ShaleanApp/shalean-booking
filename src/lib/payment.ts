/**
 * Payment utility functions for Paystack integration
 */

/**
 * Generate a unique payment reference
 * Format: BOOK_YYYYMMDD_HHMMSS_RANDOM
 */
export function generatePaymentReference(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  
  const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  return `BOOK_${timestamp}_${random}`
}

/**
 * Convert amount from Naira to Kobo
 * @param amount - Amount in Naira
 * @returns Amount in Kobo
 */
export function nairaToKobo(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Convert amount from Kobo to Naira
 * @param amount - Amount in Kobo
 * @returns Amount in Naira
 */
export function koboToNaira(amount: number): number {
  return amount / 100
}

/**
 * Format amount for display
 * @param amount - Amount in Naira
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount)
}

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate payment amount
 * @param amount - Amount in Naira
 * @returns True if amount is valid
 */
export function isValidAmount(amount: number): boolean {
  return amount > 0 && amount <= 1000000 // Max 1 million Naira
}

/**
 * Get payment status display text
 * @param status - Payment status
 * @returns Human-readable status text
 */
export function getPaymentStatusText(status: string): string {
  switch (status) {
    case 'pending':
      return 'Payment Pending'
    case 'success':
      return 'Payment Successful'
    case 'failed':
      return 'Payment Failed'
    case 'cancelled':
      return 'Payment Cancelled'
    default:
      return 'Unknown Status'
  }
}

/**
 * Get payment status color class
 * @param status - Payment status
 * @returns Tailwind CSS color class
 */
export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-100'
    case 'success':
      return 'text-green-600 bg-green-100'
    case 'failed':
      return 'text-red-600 bg-red-100'
    case 'cancelled':
      return 'text-gray-600 bg-gray-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}
