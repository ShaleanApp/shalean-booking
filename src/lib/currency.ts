/**
 * Centralized currency formatting utilities for the Shalean Cleaning Services platform
 * 
 * The application uses Nigerian Naira (NGN) as the primary currency.
 * All prices are stored in kobo (smallest unit) in the database and converted to naira for display.
 */

// Currency configuration
export const CURRENCY_CONFIG = {
  code: 'NGN',
  symbol: '₦',
  locale: 'en-NG',
  // Prices are stored in kobo (1 NGN = 100 kobo)
  koboToNaira: 100,
} as const

/**
 * Convert kobo to naira
 * @param kobo - Amount in kobo
 * @returns Amount in naira
 */
export function koboToNaira(kobo: number): number {
  return kobo / CURRENCY_CONFIG.koboToNaira
}

/**
 * Convert naira to kobo
 * @param naira - Amount in naira
 * @returns Amount in kobo
 */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * CURRENCY_CONFIG.koboToNaira)
}

/**
 * Format currency amount for display
 * @param amount - Amount in naira (not kobo)
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number, 
  options: {
    showSymbol?: boolean
    decimals?: number
    locale?: string
  } = {}
): string {
  const {
    showSymbol = true,
    decimals = 2,
    locale = CURRENCY_CONFIG.locale
  } = options

  if (showSymbol) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: CURRENCY_CONFIG.code,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount)
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

/**
 * Format currency amount from kobo (database format) to display format
 * @param koboAmount - Amount in kobo (as stored in database)
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrencyFromKobo(
  koboAmount: number,
  options: {
    showSymbol?: boolean
    decimals?: number
    locale?: string
  } = {}
): string {
  const nairaAmount = koboToNaira(koboAmount)
  return formatCurrency(nairaAmount, options)
}

/**
 * Format price for service items (from kobo to display)
 * @param koboPrice - Price in kobo
 * @returns Formatted price string
 */
export function formatServicePrice(koboPrice: number): string {
  return formatCurrencyFromKobo(koboPrice, { showSymbol: true, decimals: 2 })
}

/**
 * Format price for service extras (from kobo to display)
 * @param koboPrice - Price in kobo
 * @returns Formatted price string with + prefix
 */
export function formatExtraPrice(koboPrice: number): string {
  const formatted = formatCurrencyFromKobo(koboPrice, { showSymbol: true, decimals: 2 })
  return `+${formatted}`
}

/**
 * Format total amount for booking summary
 * @param koboAmount - Total amount in kobo
 * @returns Formatted total string
 */
export function formatTotalAmount(koboAmount: number): string {
  return formatCurrencyFromKobo(koboAmount, { showSymbol: true, decimals: 2 })
}

/**
 * Format amount for payment processing (no symbol, for API calls)
 * @param koboAmount - Amount in kobo
 * @returns Formatted amount string without currency symbol
 */
export function formatAmountForPayment(koboAmount: number): string {
  return formatCurrencyFromKobo(koboAmount, { showSymbol: false, decimals: 2 })
}

/**
 * Parse currency string back to kobo amount
 * @param currencyString - Formatted currency string
 * @returns Amount in kobo
 */
export function parseCurrencyToKobo(currencyString: string): number {
  // Remove currency symbols and commas
  const cleanString = currencyString.replace(/[₦$,]/g, '').trim()
  const nairaAmount = parseFloat(cleanString)
  
  if (isNaN(nairaAmount)) {
    throw new Error(`Invalid currency string: ${currencyString}`)
  }
  
  return nairaToKobo(nairaAmount)
}

/**
 * Get currency symbol
 * @returns Currency symbol string
 */
export function getCurrencySymbol(): string {
  return CURRENCY_CONFIG.symbol
}

/**
 * Get currency code
 * @returns Currency code string
 */
export function getCurrencyCode(): string {
  return CURRENCY_CONFIG.code
}
