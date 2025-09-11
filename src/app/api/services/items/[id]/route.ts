import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

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

// GET /api/services/items/[id]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
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

    const { data: item, error } = await supabase
      .from('service_items')
      .select(`
        *,
        category:service_categories(name)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching service item:', error)
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
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
    const validatedData = updateItemSchema.parse(body)

    // Check if item exists
    const { data: existingItem, error: fetchError } = await supabase
      .from('service_items')
      .select('id')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // If category_id is being updated, verify it exists
    if (validatedData.category_id) {
      const { data: category, error: categoryError } = await supabase
        .from('service_categories')
        .select('id')
        .eq('id', validatedData.category_id)
        .single()

      if (categoryError || !category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 400 })
      }
    }

    // Validate quantity constraints if being updated
    if (validatedData.is_quantity_based !== undefined && validatedData.is_quantity_based) {
      if (validatedData.min_quantity !== undefined && validatedData.max_quantity !== undefined) {
        if (validatedData.min_quantity > validatedData.max_quantity) {
          return NextResponse.json({ 
            error: 'Minimum quantity cannot be greater than maximum quantity' 
          }, { status: 400 })
        }
      }
    }

    const { data: item, error } = await supabase
      .from('service_items')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select(`
        *,
        category:service_categories(name)
      `)
      .single()

    if (error) {
      console.error('Error updating service item:', error)
      return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 })
    }
    console.error('Error in PUT /api/services/items/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/services/items/[id]
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
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

    // Check if item exists
    const { data: existingItem, error: fetchError } = await supabase
      .from('service_items')
      .select('id')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Check if item is referenced by any bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .contains('service_items', [{ item_id: params.id }])
      .limit(1)

    if (bookingsError) {
      console.error('Error checking item references:', bookingsError)
      return NextResponse.json({ error: 'Failed to check item references' }, { status: 500 })
    }

    if (bookings && bookings.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete item that is referenced by existing bookings' 
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('service_items')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting service item:', error)
      return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/services/items/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}