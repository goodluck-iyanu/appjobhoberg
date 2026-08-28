import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { logAuthActivity } from '@/utils/activity'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 'Direct IP'
    const userAgent = request.headers.get('user-agent') || 'Browser'

    await logAuthActivity({
      userId: user.id,
      userEmail: user.email || 'unknown@user.com',
      userName: user.user_metadata?.full_name || user.email?.split('@')[0],
      eventType: 'logout',
      ipAddress,
      userAgent,
    })
  }

  await supabase.auth.signOut()
  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/login?signed_out=true`, { status: 302 })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 'Direct IP'
    const userAgent = request.headers.get('user-agent') || 'Browser'

    await logAuthActivity({
      userId: user.id,
      userEmail: user.email || 'unknown@user.com',
      userName: user.user_metadata?.full_name || user.email?.split('@')[0],
      eventType: 'logout',
      ipAddress,
      userAgent,
    })
  }

  await supabase.auth.signOut()
  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/login?signed_out=true`, { status: 302 })
}
