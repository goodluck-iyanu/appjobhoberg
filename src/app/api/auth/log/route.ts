import { NextRequest, NextResponse } from 'next/server'
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
