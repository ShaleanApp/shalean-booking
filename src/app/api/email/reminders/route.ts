export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server';
import { sendReminderEmails } from '@/lib/email-scheduler';

export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate request (you might want to add authentication)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'your-secret-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await sendReminderEmails();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Reminder emails processed successfully' 
    });

  } catch (error) {
    console.error('Error processing reminder emails:', error);
    return NextResponse.json(
      { error: 'Failed to process reminder emails' },
      { status: 500 }
    );
  }
}
