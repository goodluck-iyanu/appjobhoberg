import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

const ADMIN_TOKEN = 'hoberg_admin_secure_session_token_2026'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('hoberg_admin_token')?.value

  if (token !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 })
  }

  try {
    const { userId, action, reviewNotes, isPremium } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    if (action === 'approve') {
      const { error } = await supabase
        .from('profiles')
        .update({
          review_status: 'approved',
          reviewed_at: new Date().toISOString(),
          review_notes: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) throw error
      return NextResponse.json({ success: true, message: 'User approved successfully' })
    }

    if (action === 'reject') {
      const { error } = await supabase
        .from('profiles')
        .update({
          review_status: 'rejected',
          review_notes: reviewNotes || 'Please ensure your CV link is public and all required fields are complete.',
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) throw error
      return NextResponse.json({ success: true, message: 'User review status set to rejected with feedback' })
    }

    if (action === 'toggle_premium') {
      const newPremiumState = !isPremium
      const { error } = await supabase
        .from('profiles')
        .update({
          is_premium: newPremiumState,
          premium_tier: newPremiumState ? 'founding_member' : 'free',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) throw error
      return NextResponse.json({
        success: true,
        message: `User premium status updated to ${newPremiumState ? 'Active' : 'Inactive'}`,
      })
    }

    if (action === 'delete') {
      // Delete user's applications first
      await supabase.from('applications').delete().eq('user_id', userId)

      // Delete user's profile
      const { error } = await supabase.from('profiles').delete().eq('id', userId)

      if (error) throw error
      return NextResponse.json({ success: true, message: 'User profile deleted successfully' })
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Action failed' }, { status: 500 })
  }
}
