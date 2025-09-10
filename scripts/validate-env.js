#!/usr/bin/env node

/**
 * Environment validation script
 * Run this script to validate your environment configuration
 * 
 * Usage:
 *   node scripts/validate-env.js
 *   node scripts/validate-env.js --production
 */

const path = require('path')
const fs = require('fs')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

// Required environment variables
const REQUIRED_VARS = [
  'NEXT_PUBLIC_BASE_URL',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
  'PAYSTACK_SECRET_KEY',
  'PAYMENT_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
  'VAPID_PRIVATE_KEY',
  'CRON_SECRET',
]

// Optional environment variables (with defaults)
const OPTIONAL_VARS = [
  // Add any optional variables here
]

function validateEnvironment() {
  const isProduction = process.argv.includes('--production') || process.env.NODE_ENV === 'production'
  const errors = []
  const warnings = []
  const missing = []
  const present = []

  console.log('🔍 Validating Environment Configuration...')
  console.log(`   Mode: ${isProduction ? 'Production' : 'Development'}`)
  console.log('')

  // Check required variables
  for (const varName of REQUIRED_VARS) {
    const value = process.env[varName]
    
    if (!value || value.trim() === '') {
      missing.push(varName)
      if (isProduction) {
        errors.push(`Missing required environment variable: ${varName}`)
      } else {
        warnings.push(`Missing environment variable: ${varName}`)
      }
    } else {
      present.push(varName)
      
      // Validate specific variables
      if (varName === 'NEXT_PUBLIC_BASE_URL' && !isValidUrl(value)) {
        errors.push(`${varName} is not a valid URL: ${value}`)
      }
      
      if (varName === 'NEXT_PUBLIC_APP_URL' && !isValidUrl(value)) {
        errors.push(`${varName} is not a valid URL: ${value}`)
      }
      
      if (varName === 'NEXT_PUBLIC_SUPABASE_URL' && !value.includes('supabase.co')) {
        warnings.push(`${varName} doesn't look like a Supabase URL: ${value}`)
      }
      
      if (varName === 'RESEND_FROM_EMAIL' && !isValidEmail(value)) {
        warnings.push(`${varName} doesn't look like a valid email: ${value}`)
      }
      
      // Production-specific validations
      if (isProduction) {
        if (varName === 'NEXT_PUBLIC_BASE_URL' && value.includes('localhost')) {
          errors.push(`${varName} should not contain localhost in production`)
        }
        
        if (varName === 'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY' && value.startsWith('pk_test_')) {
          warnings.push(`${varName} is using test key in production - should use live key`)
        }
        
        if (varName === 'PAYSTACK_SECRET_KEY' && value.startsWith('sk_test_')) {
          warnings.push(`${varName} is using test secret in production - should use live secret`)
        }
      }
    }
  }

  // Check optional variables
  for (const varName of OPTIONAL_VARS) {
    const value = process.env[varName]
    if (value && value.trim() !== '') {
      present.push(varName)
    }
  }

  // Display results
  console.log('📊 Validation Results:')
  console.log(`   Total required variables: ${REQUIRED_VARS.length}`)
  console.log(`   Present: ${present.length}`)
  console.log(`   Missing: ${missing.length}`)
  console.log(`   Errors: ${errors.length}`)
  console.log(`   Warnings: ${warnings.length}`)
  console.log('')

  if (errors.length > 0) {
    console.error('❌ ERRORS (must be fixed):')
    errors.forEach(error => console.error(`   - ${error}`))
    console.log('')
  }

  if (warnings.length > 0) {
    console.warn('⚠️  WARNINGS (should be addressed):')
    warnings.forEach(warning => console.warn(`   - ${warning}`))
    console.log('')
  }

  if (missing.length > 0) {
    console.log('📝 Missing Variables:')
    missing.forEach(varName => console.log(`   - ${varName}`))
    console.log('')
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All environment variables are properly configured!')
  } else if (errors.length === 0) {
    console.log('✅ Environment is functional, but please address warnings.')
  } else {
    console.log('❌ Environment has errors that must be fixed.')
  }

  // Show next steps
  if (missing.length > 0 || errors.length > 0) {
    console.log('')
    console.log('📋 Next Steps:')
    console.log('   1. Copy .env.example to .env.local')
    console.log('   2. Fill in the missing environment variables')
    console.log('   3. Run this script again to validate')
    console.log('')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missing,
    present,
  }
}

function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

function isValidEmail(string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(string)
}

// Run validation
const result = validateEnvironment()

// Exit with appropriate code
process.exit(result.isValid ? 0 : 1)
