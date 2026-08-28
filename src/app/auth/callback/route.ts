import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'
import { logAuthActivity } from '@/utils/activity'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      const user = data.user
      const forwardedFor = request.headers.get('x-forwarded-for')
      const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 'Direct IP'
      const userAgent = request.headers.get('user-agent') || 'Browser'

      // 1. Auto-create/upsert profile row so "User profile not found" never occurs
      try {
        const adminSupabase = createAdminClient()
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'Candidate'

        const { data: existingProfile } = await adminSupabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (!existingProfile) {
          await adminSupabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name: fullName,
            display_name: fullName,
            review_status: 'draft',
            created_at: new Date().toISOString(),
          })
        }
      } catch (err) {
        console.error('Auto-profile creation notice:', err)
      }

      // 2. Record login event for security and audit trail
      await logAuthActivity({
        userId: user.id,
        userEmail: user.email || 'unknown@user.com',
        userName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
        eventType: 'login',
        ipAddress,
        userAgent,
      })

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions if auth failed
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
