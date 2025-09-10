const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://svqzggstrlifddamrlfb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2cXpnZ3N0cmxpZmRkYW1ybGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MjczNjcsImV4cCI6MjA3MjUwMzM2N30.pP98qP4EZz6HrgY6lZk9Un7nvPMbnAjKg3w4HXIV9FY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  try {
    console.log('Testing database connection...')
    
    // Test service_categories table
    const { data: categories, error: catError } = await supabase
      .from('service_categories')
      .select('*')
      .limit(5)
    
    if (catError) {
      console.error('Error fetching categories:', catError)
    } else {
      console.log('Categories found:', categories?.length || 0)
      console.log('Sample category:', categories?.[0])
    }
    
    // Test service_items table
    const { data: items, error: itemsError } = await supabase
      .from('service_items')
      .select('*')
      .limit(5)
    
    if (itemsError) {
      console.error('Error fetching items:', itemsError)
    } else {
      console.log('Items found:', items?.length || 0)
      console.log('Sample item:', items?.[0])
    }
    
  } catch (error) {
    console.error('Database test failed:', error)
  }
}

testDatabase()
