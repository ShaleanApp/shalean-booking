"use client"

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { FieldValidation, validateField } from '@/lib/validation'

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  helpText?: string
  className?: string
  children: React.ReactNode
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, required, helpText, className, children }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {children}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {helpText && !error && (
          <p className="text-sm text-muted-foreground">{helpText}</p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  required?: boolean
  helpText?: string
  validation?: FieldValidation
  onValidationChange?: (validation: FieldValidation) => void
}

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ label, error, required, helpText, validation, onValidationChange, className, ...props }, ref) => {
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (onValidationChange && props.value !== undefined) {
        // This would be used with validation rules
        // const validation = validateField(props.value, rules)
        // onValidationChange(validation)
      }
      props.onBlur?.(e)
    }

    return (
      <FormField
        label={label}
        error={error || validation?.error}
        required={required}
        helpText={helpText}
      >
        <input
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error || validation?.error ? 'border-red-500 focus-visible:ring-red-500' : '',
            className
          )}
          onBlur={handleBlur}
          {...props}
        />
      </FormField>
    )
  }
)

ValidatedInput.displayName = 'ValidatedInput'

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  required?: boolean
  helpText?: string
  validation?: FieldValidation
  onValidationChange?: (validation: FieldValidation) => void
}

export const ValidatedTextarea = forwardRef<HTMLTextAreaElement, ValidatedTextareaProps>(
  ({ label, error, required, helpText, validation, onValidationChange, className, ...props }, ref) => {
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (onValidationChange && props.value !== undefined) {
        // This would be used with validation rules
        // const validation = validateField(props.value, rules)
        // onValidationChange(validation)
      }
      props.onBlur?.(e)
    }

    return (
      <FormField
        label={label}
        error={error || validation?.error}
        required={required}
        helpText={helpText}
      >
        <textarea
          ref={ref}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error || validation?.error ? 'border-red-500 focus-visible:ring-red-500' : '',
            className
          )}
          onBlur={handleBlur}
          {...props}
        />
      </FormField>
    )
  }
)

ValidatedTextarea.displayName = 'ValidatedTextarea'

interface ValidatedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  required?: boolean
  helpText?: string
  validation?: FieldValidation
  onValidationChange?: (validation: FieldValidation) => void
  options: { value: string; label: string }[]
  placeholder?: string
}

export const ValidatedSelect = forwardRef<HTMLSelectElement, ValidatedSelectProps>(
  ({ label, error, required, helpText, validation, onValidationChange, options, placeholder, className, ...props }, ref) => {
    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      if (onValidationChange && props.value !== undefined) {
        // This would be used with validation rules
        // const validation = validateField(props.value, rules)
        // onValidationChange(validation)
      }
      props.onBlur?.(e)
    }

    return (
      <FormField
        label={label}
        error={error || validation?.error}
        required={required}
        helpText={helpText}
      >
        <select
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error || validation?.error ? 'border-red-500 focus-visible:ring-red-500' : '',
            className
          )}
          onBlur={handleBlur}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>
    )
  }
)

ValidatedSelect.displayName = 'ValidatedSelect'

interface FormErrorProps {
  error: string
  className?: string
}

export function FormError({ error, className }: FormErrorProps) {
  if (!error) return null

  return (
    <div className={cn('text-sm text-red-600', className)}>
      {error}
    </div>
  )
}

interface FormSuccessProps {
  message: string
  className?: string
}

export function FormSuccess({ message, className }: FormSuccessProps) {
  if (!message) return null

  return (
    <div className={cn('text-sm text-green-600', className)}>
      {message}
    </div>
  )
}
