import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/public/services/items - Public endpoint for customers
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active_only') === 'true'
    const categoryId = searchParams.get('category_id')

    let query = supabase
      .from('service_items')
      .select(`
        *,
        category:service_categories(id, name, description, icon)
      `)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data: items, error } = await query

    if (error) {
      console.error('Error fetching service items:', error)
      return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
    }

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error in GET /api/public/services/items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
