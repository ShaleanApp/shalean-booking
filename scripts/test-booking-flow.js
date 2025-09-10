#!/usr/bin/env node

/**
 * Test script for booking flow functionality
 * Tests the API endpoints and booking process
 */

const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'

async function testBookingFlow() {
  console.log('🧪 Testing Booking Flow Functionality...')
  console.log(`   Base URL: ${BASE_URL}`)
  console.log('')

  const results = {
    serviceCategories: false,
    serviceItems: false,
    serviceExtras: false,
    bookingCreation: false,
  }

  try {
    // Test 1: Service Categories API
    console.log('1️⃣ Testing Service Categories API...')
    try {
      const response = await fetch(`${BASE_URL}/api/public/services/categories?active_only=true`)
      const data = await response.json()
      
      if (response.ok && data.categories && data.categories.length > 0) {
        console.log(`   ✅ Service Categories API working (${data.categories.length} categories)`)
        results.serviceCategories = true
      } else {
        console.log('   ❌ Service Categories API failed')
      }
    } catch (error) {
      console.log(`   ❌ Service Categories API error: ${error.message}`)
    }

    // Test 2: Service Items API
    console.log('2️⃣ Testing Service Items API...')
    try {
      const response = await fetch(`${BASE_URL}/api/public/services/items?active_only=true`)
      const data = await response.json()
      
      if (response.ok && data.items && data.items.length > 0) {
        console.log(`   ✅ Service Items API working (${data.items.length} items)`)
        results.serviceItems = true
      } else {
        console.log('   ❌ Service Items API failed')
      }
    } catch (error) {
      console.log(`   ❌ Service Items API error: ${error.message}`)
    }

    // Test 3: Service Extras API
    console.log('3️⃣ Testing Service Extras API...')
    try {
      const response = await fetch(`${BASE_URL}/api/public/services/extras?active_only=true`)
      const data = await response.json()
      
      if (response.ok && data.extras) {
        console.log(`   ✅ Service Extras API working (${data.extras.length} extras)`)
        results.serviceExtras = true
      } else {
        console.log('   ❌ Service Extras API failed')
      }
    } catch (error) {
      console.log(`   ❌ Service Extras API error: ${error.message}`)
    }

    // Test 4: Booking Creation API (without authentication - should fail gracefully)
    console.log('4️⃣ Testing Booking Creation API...')
    try {
      const testBookingData = {
        formData: {
          services: [{ service_item_id: 'test-id', quantity: 1 }],
          extras: [],
          service_date: '2024-12-25',
          service_time: '10:00',
          notes: 'Test booking',
          frequency: 'once'
        }
      }

      const response = await fetch(`${BASE_URL}/api/bookings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testBookingData)
      })
      
      if (response.status === 401) {
        console.log('   ✅ Booking Creation API properly requires authentication')
        results.bookingCreation = true
      } else {
        console.log(`   ⚠️  Booking Creation API returned unexpected status: ${response.status}`)
      }
    } catch (error) {
      console.log(`   ❌ Booking Creation API error: ${error.message}`)
    }

  } catch (error) {
    console.error('❌ Test suite error:', error)
  }

  // Summary
  console.log('')
  console.log('📊 Test Results Summary:')
  console.log(`   Service Categories: ${results.serviceCategories ? '✅' : '❌'}`)
  console.log(`   Service Items: ${results.serviceItems ? '✅' : '❌'}`)
  console.log(`   Service Extras: ${results.serviceExtras ? '✅' : '❌'}`)
  console.log(`   Booking Creation: ${results.bookingCreation ? '✅' : '❌'}`)
  
  const allPassed = Object.values(results).every(result => result === true)
  
  if (allPassed) {
    console.log('')
    console.log('🎉 All booking flow tests passed!')
    console.log('   The booking system is ready for use.')
  } else {
    console.log('')
    console.log('⚠️  Some tests failed. Please check the issues above.')
  }

  return allPassed
}

// Run the test
testBookingFlow()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Test suite failed:', error)
    process.exit(1)
  })
