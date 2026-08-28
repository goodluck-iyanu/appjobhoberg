import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { logAuthActivity } from '@/utils/activity'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, userEmail, userName, eventType } = body

    if (!userId || !userEmail || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields (userId, userEmail, eventType)' },
        { status: 400 }
      )
    }

    const forwardedFor = req.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 'Direct IP'
    const userAgent = req.headers.get('user-agent') || 'Browser'

    // Auto-create/ensure profile row exists in database
    try {
      const adminSupabase = createAdminClient()
      const { data: existingProfile } = await adminSupabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle()

      if (!existingProfile) {
        await adminSupabase.from('profiles').insert({
          id: userId,
          email: userEmail,
          full_name: userName || userEmail.split('@')[0],
          display_name: userName || userEmail.split('@')[0],
          review_status: 'draft',
          created_at: new Date().toISOString(),
        })
      }
    } catch (e) {
      console.error('Profile sync notice:', e)
    }

    await logAuthActivity({
      userId,
      userEmail,
      userName,
      eventType,
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Error logging auth activity:', err)
    return NextResponse.json(
      { error: err?.message || 'Internal logging error' },
      { status: 500 }
    )
  }
}
