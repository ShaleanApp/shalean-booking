import { createAdminClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    // Test the notification triggers function
    const { data, error } = await supabase.rpc('test_notification_triggers')
    
    if (error) {
      console.error('Error testing notification triggers:', error)
      return NextResponse.json(
        { error: 'Failed to test notification triggers', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification triggers tested successfully',
      results: data,
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Unexpected error testing notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    // Get recent notifications for debugging
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch notifications', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      notifications,
      count: notifications?.length || 0
    })

  } catch (error) {
    console.error('Unexpected error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

