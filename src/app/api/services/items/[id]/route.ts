import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const updateItemSchema = z.object({
  category_id: z.string().uuid('Invalid category ID').optional(),
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  base_price: z.number().min(0, 'Base price must be non-negative').optional(),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().optional()
})

// GET /api/services/items/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: item, error } = await supabase
      .from('service_items')
      .select(`
        *,
        category:service_categories(id, name, description)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
      }
      console.error('Error fetching service item:', error)
      return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Error in GET /api/services/items/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/services/items/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = updateItemSchema.parse(body)

    // If category_id is being updated, verify category exists
    if (validatedData.category_id) {
      const { data: category } = await supabase
        .from('service_categories')
        .select('id')
        .eq('id', validatedData.category_id)
        .single()

      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 400 })
      }
    }

    const { data: item, error } = await supabase
      .from('service_items')
      .update(validatedData)
      .eq('id', params.id)
      .select(`
        *,
        category:service_categories(id, name, description)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
      }
      console.error('Error updating service item:', error)
      return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error in PUT /api/services/items/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/services/items/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if item has associated bookings
    const { data: bookingServices } = await supabase
      .from('booking_services')
      .select('id')
      .eq('service_item_id', params.id)
      .limit(1)

    if (bookingServices && bookingServices.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete item with associated bookings' 
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('service_items')
      .delete()
      .eq('id', params.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
      }
      console.error('Error deleting service item:', error)
      return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/services/items/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
