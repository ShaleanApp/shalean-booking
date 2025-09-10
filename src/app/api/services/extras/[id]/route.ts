import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const updateExtraSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().optional()
})

// GET /api/services/extras/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: extraId } = await params
    
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

    const { data: extra, error } = await supabase
      .from('service_extras')
      .select('*')
      .eq('id', extraId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Extra not found' }, { status: 404 })
      }
      console.error('Error fetching service extra:', error)
      return NextResponse.json({ error: 'Failed to fetch extra' }, { status: 500 })
    }

    return NextResponse.json({ extra })
  } catch (error) {
    console.error('Error in GET /api/services/extras/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/services/extras/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: extraId } = await params
    
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
    const validatedData = updateExtraSchema.parse(body)

    const { data: extra, error } = await supabase
      .from('service_extras')
      .update(validatedData)
      .eq('id', extraId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Extra not found' }, { status: 404 })
      }
      console.error('Error updating service extra:', error)
      return NextResponse.json({ error: 'Failed to update extra' }, { status: 500 })
    }

    return NextResponse.json({ extra })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error in PUT /api/services/extras/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/services/extras/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: extraId } = await params
    
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

    // Check if extra has associated bookings
    const { data: bookingExtras } = await supabase
      .from('booking_extras')
      .select('id')
      .eq('service_extra_id', extraId)
      .limit(1)

    if (bookingExtras && bookingExtras.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete extra with associated bookings' 
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('service_extras')
      .delete()
      .eq('id', extraId)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Extra not found' }, { status: 404 })
      }
      console.error('Error deleting service extra:', error)
      return NextResponse.json({ error: 'Failed to delete extra' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Extra deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/services/extras/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
