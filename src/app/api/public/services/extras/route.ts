import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/public/services/extras - Public endpoint for customers
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active_only') === 'true'

    let query = supabase
      .from('service_extras')
      .select('*')
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: extras, error } = await query

    if (error) {
      console.error('Error fetching service extras:', error)
      return NextResponse.json({ error: 'Failed to fetch extras' }, { status: 500 })
    }

    return NextResponse.json({ extras })
  } catch (error) {
    console.error('Error in GET /api/public/services/extras:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
