import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const createItemSchema = z.object({
  category_id: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  base_price: z.number().min(0, 'Price must be non-negative'),
  unit: z.string().min(1, 'Unit is required'),
  is_quantity_based: z.boolean(),
  min_quantity: z.number().min(1, 'Minimum quantity must be at least 1'),
  max_quantity: z.number().min(1, 'Maximum quantity must be at least 1'),
  is_active: z.boolean().optional()
})

const updateItemSchema = z.object({
  category_id: z.string().optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  base_price: z.number().min(0).optional(),
  unit: z.string().min(1).optional(),
  is_quantity_based: z.boolean().optional(),
  min_quantity: z.number().min(1).optional(),
  max_quantity: z.number().min(1).optional(),
  is_active: z.boolean().optional()
})

// GET /api/services/items
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
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

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category_id')
    const isActive = searchParams.get('is_active')

    let query = supabase
      .from('service_items')
      .select(`
        *,
        category:service_categories(name)
      `)
      .order('created_at', { ascending: false })

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
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
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
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
    const { data: category, error: categoryError } = await supabase
      .from('service_categories')
      .select('id')
      .eq('id', validatedData.category_id)
      .single()

    if (categoryError || !category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 })
    }

    // Validate quantity constraints
    if (validatedData.is_quantity_based) {
      if (validatedData.min_quantity > validatedData.max_quantity) {
        return NextResponse.json({ 
          error: 'Minimum quantity cannot be greater than maximum quantity' 
        }, { status: 400 })
      }
    }

    const { data: item, error } = await supabase
      .from('service_items')
      .insert({
        ...validatedData,
        is_active: validatedData.is_active ?? true
      })
      .select(`
        *,
        category:service_categories(name)
      `)
      .single()

    if (error) {
      console.error('Error creating service item:', error)
      return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
    }

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 })
    }
    console.error('Error in POST /api/services/items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}