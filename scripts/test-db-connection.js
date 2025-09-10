#!/usr/bin/env node

/**
 * Test database connection and check if service_extras table exists
 */

const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...')
  console.log('')

  try {
    // Test if we can connect to the database via the API
    const response = await fetch('http://localhost:3002/api/public/services/categories?active_only=true')
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Database connection working')
      console.log(`   Found ${data.categories?.length || 0} service categories`)
    } else {
      console.log('❌ Database connection failed')
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${data.error || 'Unknown error'}`)
    }

    // Test service items
    const itemsResponse = await fetch('http://localhost:3002/api/public/services/items?active_only=true')
    const itemsData = await itemsResponse.json()
    
    if (itemsResponse.ok) {
      console.log(`✅ Service items working (${itemsData.items?.length || 0} items)`)
    } else {
      console.log('❌ Service items failed')
    }

    // Test service extras
    const extrasResponse = await fetch('http://localhost:3002/api/public/services/extras?active_only=true')
    
    if (extrasResponse.ok) {
      const extrasData = await extrasResponse.json()
      console.log(`✅ Service extras working (${extrasData.extras?.length || 0} extras)`)
    } else {
      console.log(`❌ Service extras failed (Status: ${extrasResponse.status})`)
      
      // Try to get the error message
      try {
        const errorData = await extrasResponse.text()
        console.log(`   Error response: ${errorData.substring(0, 200)}...`)
      } catch (e) {
        console.log('   Could not read error response')
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testDatabaseConnection()
