import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const createItemSchema = z.object({
  category_id: z.string().uuid('Invalid category ID'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  base_price: z.number().min(0, 'Base price must be non-negative'),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute'),
  is_active: z.boolean().default(true),
  sort_order: z.number().default(0)
})

const updateItemSchema = createItemSchema.partial()

// GET /api/services/items
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and has admin role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active_only') === 'true'
    const categoryId = searchParams.get('category_id')

    let query = supabase
      .from('service_items')
      .select(`
        *,
        category:service_categories(id, name, description)
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
    console.error('Error in GET /api/services/items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/services/items
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and has admin role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createItemSchema.parse(body)

    // Verify category exists
    const { data: category } = await supabase
      .from('service_categories')
      .select('id')
      .eq('id', validatedData.category_id)
      .single()

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 })
    }

    const { data: item, error } = await supabase
      .from('service_items')
      .insert(validatedData)
      .select(`
        *,
        category:service_categories(id, name, description)
      `)
      .single()

    if (error) {
      console.error('Error creating service item:', error)
      return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
    }

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error in POST /api/services/items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
