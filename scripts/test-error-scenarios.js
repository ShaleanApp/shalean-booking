#!/usr/bin/env node

/**
 * Test script for error scenarios and recovery
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'

console.log('🧪 Testing Error Scenarios and Recovery...')
console.log(`   Base URL: ${BASE_URL}`)

async function testErrorScenarios() {
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  }

  // Test 1: Invalid API endpoint
  console.log('\n1️⃣ Testing Invalid API Endpoint...')
  try {
    const response = await fetch(`${BASE_URL}/api/invalid-endpoint`)
    if (response.status === 404) {
      console.log('   ✅ Invalid endpoint returns 404')
      results.passed++
      results.tests.push({ name: 'Invalid API endpoint', status: 'PASS' })
    } else {
      console.log(`   ❌ Expected 404, got ${response.status}`)
      results.failed++
      results.tests.push({ name: 'Invalid API endpoint', status: 'FAIL' })
    }
  } catch (error) {
    console.log('   ❌ Network error:', error.message)
    results.failed++
    results.tests.push({ name: 'Invalid API endpoint', status: 'FAIL' })
  }

  // Test 2: Service Extras API with invalid parameters
  console.log('\n2️⃣ Testing Service Extras API with Invalid Parameters...')
  try {
    const response = await fetch(`${BASE_URL}/api/public/services/extras?invalid_param=test`)
    if (response.ok) {
      const data = await response.json()
      if (data.extras && Array.isArray(data.extras)) {
        console.log('   ✅ API handles invalid parameters gracefully')
        results.passed++
        results.tests.push({ name: 'Invalid parameters handling', status: 'PASS' })
      } else {
        console.log('   ❌ Invalid response format')
        results.failed++
        results.tests.push({ name: 'Invalid parameters handling', status: 'FAIL' })
      }
    } else {
      console.log(`   ❌ API returned error: ${response.status}`)
      results.failed++
      results.tests.push({ name: 'Invalid parameters handling', status: 'FAIL' })
    }
  } catch (error) {
    console.log('   ❌ Network error:', error.message)
    results.failed++
    results.tests.push({ name: 'Invalid parameters handling', status: 'FAIL' })
  }

  // Test 3: Booking creation without authentication
  console.log('\n3️⃣ Testing Booking Creation Without Authentication...')
  try {
    const response = await fetch(`${BASE_URL}/api/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formData: {
          services: [],
          extras: [],
          service_date: '',
          service_time: '',
          address_id: null,
          new_address: null
        },
        isGuest: false
      })
    })
    
    if (response.status === 401) {
      console.log('   ✅ Unauthenticated booking creation properly rejected')
      results.passed++
      results.tests.push({ name: 'Unauthenticated booking creation', status: 'PASS' })
    } else {
      console.log(`   ❌ Expected 401, got ${response.status}`)
      results.failed++
      results.tests.push({ name: 'Unauthenticated booking creation', status: 'FAIL' })
    }
  } catch (error) {
    console.log('   ❌ Network error:', error.message)
    results.failed++
    results.tests.push({ name: 'Unauthenticated booking creation', status: 'FAIL' })
  }

  // Test 4: Invalid booking data
  console.log('\n4️⃣ Testing Invalid Booking Data...')
  try {
    const response = await fetch(`${BASE_URL}/api/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      },
      body: JSON.stringify({
        formData: {
          services: 'invalid', // Should be array
          extras: 'invalid',   // Should be array
          service_date: 'invalid-date',
          service_time: 'invalid-time',
          address_id: 'invalid-uuid',
          new_address: null
        },
        isGuest: 'invalid' // Should be boolean
      })
    })
    
    if (response.status === 400 || response.status === 401) {
      console.log('   ✅ Invalid booking data properly rejected')
      results.passed++
      results.tests.push({ name: 'Invalid booking data', status: 'PASS' })
    } else {
      console.log(`   ❌ Expected 400/401, got ${response.status}`)
      results.failed++
      results.tests.push({ name: 'Invalid booking data', status: 'FAIL' })
    }
  } catch (error) {
    console.log('   ❌ Network error:', error.message)
    results.failed++
    results.tests.push({ name: 'Invalid booking data', status: 'FAIL' })
  }

  // Test 5: Large payload handling
  console.log('\n5️⃣ Testing Large Payload Handling...')
  try {
    const largePayload = {
      formData: {
        services: Array(1000).fill({ service_item_id: 'test', quantity: 1 }),
        extras: Array(1000).fill({ service_extra_id: 'test', quantity: 1 }),
        service_date: '2024-12-31',
        service_time: '10:00',
        address_id: 'test',
        new_address: 'A'.repeat(10000) // Very long address
      },
      isGuest: false
    }

    const response = await fetch(`${BASE_URL}/api/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      },
      body: JSON.stringify(largePayload)
    })
    
    if (response.status === 400 || response.status === 413 || response.status === 401) {
      console.log('   ✅ Large payload properly handled')
      results.passed++
      results.tests.push({ name: 'Large payload handling', status: 'PASS' })
    } else {
      console.log(`   ❌ Expected 400/413/401, got ${response.status}`)
      results.failed++
      results.tests.push({ name: 'Large payload handling', status: 'FAIL' })
    }
  } catch (error) {
    console.log('   ❌ Network error:', error.message)
    results.failed++
    results.tests.push({ name: 'Large payload handling', status: 'FAIL' })
  }

  // Test 6: Malformed JSON
  console.log('\n6️⃣ Testing Malformed JSON...')
  try {
    const response = await fetch(`${BASE_URL}/api/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      },
      body: '{"invalid": json}' // Malformed JSON
    })
    
    if (response.status === 400 || response.status === 401) {
      console.log('   ✅ Malformed JSON properly rejected')
      results.passed++
      results.tests.push({ name: 'Malformed JSON', status: 'PASS' })
    } else {
      console.log(`   ❌ Expected 400/401, got ${response.status}`)
      results.failed++
      results.tests.push({ name: 'Malformed JSON', status: 'FAIL' })
    }
  } catch (error) {
    console.log('   ❌ Network error:', error.message)
    results.failed++
    results.tests.push({ name: 'Malformed JSON', status: 'FAIL' })
  }

  // Test 7: Missing Content-Type header
  console.log('\n7️⃣ Testing Missing Content-Type Header...')
  try {
    const response = await fetch(`${BASE_URL}/api/bookings/create`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invalid-token'
      },
      body: JSON.stringify({
        formData: { services: [], extras: [] },
        isGuest: false
      })
    })
    
    if (response.status === 400 || response.status === 401) {
      console.log('   ✅ Missing Content-Type properly handled')
      results.passed++
      results.tests.push({ name: 'Missing Content-Type', status: 'PASS' })
    } else {
      console.log(`   ❌ Expected 400/401, got ${response.status}`)
      results.failed++
      results.tests.push({ name: 'Missing Content-Type', status: 'FAIL' })
    }
  } catch (error) {
    console.log('   ❌ Network error:', error.message)
    results.failed++
    results.tests.push({ name: 'Missing Content-Type', status: 'FAIL' })
  }

  return results
}

async function main() {
  try {
    const results = await testErrorScenarios()
    
    console.log('\n📊 Test Results Summary:')
    results.tests.forEach(test => {
      console.log(`   ${test.name}: ${test.status === 'PASS' ? '✅' : '❌'}`)
    })
    
    console.log(`\n🎯 Final Results:`)
    console.log(`   Passed: ${results.passed}`)
    console.log(`   Failed: ${results.failed}`)
    console.log(`   Total: ${results.passed + results.failed}`)
    
    if (results.failed === 0) {
      console.log('\n🎉 All error scenario tests passed!')
      console.log('   The application handles errors gracefully.')
    } else {
      console.log('\n⚠️  Some error scenario tests failed.')
      console.log('   Review the failed tests and improve error handling.')
    }
    
    process.exit(results.failed === 0 ? 0 : 1)
  } catch (error) {
    console.error('❌ Test script error:', error)
    process.exit(1)
  }
}

main()
