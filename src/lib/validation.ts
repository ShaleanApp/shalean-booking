/**
 * Comprehensive form validation utilities
 */

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
  message?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface FieldValidation {
  isValid: boolean
  error?: string
}

/**
 * Common validation patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  NIGERIAN_PHONE: /^(\+234|234|0)?[789][01]\d{8}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHA_ONLY: /^[a-zA-Z\s]+$/,
  NUMERIC: /^\d+$/,
  DECIMAL: /^\d+(\.\d{1,2})?$/,
  URL: /^https?:\/\/.+/,
  POSTAL_CODE: /^\d{5}(-\d{4})?$/,
} as const

/**
 * Common validation messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PHONE_INVALID: 'Please enter a valid phone number',
  NIGERIAN_PHONE_INVALID: 'Please enter a valid Nigerian phone number',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters long`,
  MAX_LENGTH: (max: number) => `Must be no more than ${max} characters long`,
  PATTERN_INVALID: 'Please enter a valid value',
  NUMERIC_ONLY: 'Please enter numbers only',
  DECIMAL_INVALID: 'Please enter a valid decimal number',
  URL_INVALID: 'Please enter a valid URL',
  POSTAL_CODE_INVALID: 'Please enter a valid postal code',
} as const

/**
 * Validate a single field
 */
export function validateField(value: any, rules: ValidationRule): FieldValidation {
  // Check required
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return {
      isValid: false,
      error: rules.message || VALIDATION_MESSAGES.REQUIRED
    }
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: true }
  }

  const stringValue = String(value)

  // Check min length
  if (rules.minLength && stringValue.length < rules.minLength) {
    return {
      isValid: false,
      error: rules.message || VALIDATION_MESSAGES.MIN_LENGTH(rules.minLength)
    }
  }

  // Check max length
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return {
      isValid: false,
      error: rules.message || VALIDATION_MESSAGES.MAX_LENGTH(rules.maxLength)
    }
  }

  // Check pattern
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return {
      isValid: false,
      error: rules.message || VALIDATION_MESSAGES.PATTERN_INVALID
    }
  }

  // Check custom validation
  if (rules.custom) {
    const customError = rules.custom(value)
    if (customError) {
      return {
        isValid: false,
        error: customError
      }
    }
  }

  return { isValid: true }
}

/**
 * Validate multiple fields
 */
export function validateFields(fields: Record<string, any>, rules: Record<string, ValidationRule>): ValidationResult {
  const errors: Record<string, string> = {}
  let isValid = true

  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const fieldValue = fields[fieldName]
    const validation = validateField(fieldValue, fieldRules)
    
    if (!validation.isValid) {
      errors[fieldName] = validation.error!
      isValid = false
    }
  }

  return { isValid, errors }
}

/**
 * Common validation rules
 */
export const VALIDATION_RULES = {
  EMAIL: {
    required: true,
    pattern: VALIDATION_PATTERNS.EMAIL,
    message: VALIDATION_MESSAGES.EMAIL_INVALID
  },
  
  PHONE: {
    required: true,
    pattern: VALIDATION_PATTERNS.PHONE,
    message: VALIDATION_MESSAGES.PHONE_INVALID
  },
  
  NIGERIAN_PHONE: {
    required: true,
    pattern: VALIDATION_PATTERNS.NIGERIAN_PHONE,
    message: VALIDATION_MESSAGES.NIGERIAN_PHONE_INVALID
  },
  
  NAME: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.ALPHA_ONLY,
    message: 'Please enter a valid name (letters and spaces only)'
  },
  
  PASSWORD: {
    required: true,
    minLength: 8,
    message: 'Password must be at least 8 characters long'
  },
  
  ADDRESS: {
    required: true,
    minLength: 10,
    maxLength: 200,
    message: 'Please enter a complete address'
  },
  
  CITY: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.ALPHA_ONLY,
    message: 'Please enter a valid city name'
  },
  
  POSTAL_CODE: {
    required: true,
    pattern: VALIDATION_PATTERNS.POSTAL_CODE,
    message: VALIDATION_MESSAGES.POSTAL_CODE_INVALID
  },
  
  QUANTITY: {
    required: true,
    custom: (value: any) => {
      const num = Number(value)
      if (isNaN(num) || num < 1 || num > 10) {
        return 'Quantity must be between 1 and 10'
      }
      return null
    }
  },
  
  DATE: {
    required: true,
    custom: (value: any) => {
      const date = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (isNaN(date.getTime())) {
        return 'Please enter a valid date'
      }
      
      if (date < today) {
        return 'Date cannot be in the past'
      }
      
      return null
    }
  },
  
  TIME: {
    required: true,
    custom: (value: any) => {
      if (!value || typeof value !== 'string') {
        return 'Please select a time'
      }
      
      const [hours, minutes] = value.split(':').map(Number)
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return 'Please enter a valid time'
      }
      
      return null
    }
  }
} as const

/**
 * Booking form validation rules
 */
export const BOOKING_VALIDATION_RULES = {
  services: {
    required: true,
    custom: (value: any) => {
      if (!Array.isArray(value) || value.length === 0) {
        return 'Please select at least one service'
      }
      return null
    }
  },
  
  service_date: VALIDATION_RULES.DATE,
  service_time: VALIDATION_RULES.TIME,
  
  address_id: {
    custom: (value: any, allValues: any) => {
      if (!value && !allValues.new_address) {
        return 'Please select an address or add a new one'
      }
      return null
    }
  },
  
  new_address: {
    custom: (value: any, allValues: any) => {
      if (!allValues.address_id && !value) {
        return 'Please provide an address'
      }
      if (value) {
        return validateField(value, VALIDATION_RULES.ADDRESS).error || null
      }
      return null
    }
  }
} as const

/**
 * User profile validation rules
 */
export const PROFILE_VALIDATION_RULES = {
  first_name: VALIDATION_RULES.NAME,
  last_name: VALIDATION_RULES.NAME,
  email: VALIDATION_RULES.EMAIL,
  phone: VALIDATION_RULES.NIGERIAN_PHONE,
  address: VALIDATION_RULES.ADDRESS,
  city: VALIDATION_RULES.CITY,
  postal_code: VALIDATION_RULES.POSTAL_CODE
} as const

/**
 * Address validation rules
 */
export const ADDRESS_VALIDATION_RULES = {
  street_address: VALIDATION_RULES.ADDRESS,
  city: VALIDATION_RULES.CITY,
  state: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.ALPHA_ONLY,
    message: 'Please enter a valid state name'
  },
  postal_code: VALIDATION_RULES.POSTAL_CODE,
  country: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.ALPHA_ONLY,
    message: 'Please enter a valid country name'
  }
} as const

/**
 * Real-time validation hook
 */
export function useValidation<T extends Record<string, any>>(
  initialValues: T,
  rules: Record<keyof T, ValidationRule>
) {
  const [values, setValues] = React.useState<T>(initialValues)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})

  const validateFieldLocal = React.useCallback((fieldName: keyof T, value: any) => {
    const fieldRules = rules[fieldName]
    if (!fieldRules) return

    const validation = validateField(value, fieldRules)
    setErrors(prev => ({
      ...prev,
      [fieldName as string]: validation.error || ''
    }))
  }, [rules])

  const validateAll = React.useCallback(() => {
    const result = validateFields(values, rules as Record<string, ValidationRule>)
    setErrors(result.errors)
    return result.isValid
  }, [values, rules])

  const setValue = React.useCallback((fieldName: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [fieldName]: value }))
    
    if (touched[fieldName as string]) {
      validateFieldLocal(fieldName, value)
    }
  }, [touched, validateFieldLocal])

  const setTouchedField = React.useCallback((fieldName: keyof T) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    validateFieldLocal(fieldName, values[fieldName])
  }, [values, validateFieldLocal])

  const reset = React.useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isValid: Object.keys(errors).length === 0,
    setValue,
    setTouchedField,
    validateField: validateFieldLocal,
    validateAll,
    reset
  }
}

// Import React for the hook
import React from 'react'
