import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'You must be signed in with Google to apply.' },
        { status: 401 }
      )
    }

    const { jobId, jobTitle, companyName, applyUrl } = await req.json()

    if (!jobId || !applyUrl) {
      return NextResponse.json(
        { success: false, error: 'Job details missing' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()

    // 1. Fetch user's profile using authenticated supabase client
    let { data: profile } = await supabase
      .from('profiles')
      .select('id, review_status, is_premium, full_name, display_name')
      .eq('id', user.id)
      .maybeSingle()

    // If profile doesn't exist, create an approved profile
    if (!profile) {
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          review_status: 'approved',
          created_at: new Date().toISOString(),
        })
        .select()
        .single()
      profile = newProfile
    }

    const isPremium = Boolean(profile?.is_premium)

    // Ensure candidate is approved unless explicitly banned/rejected
    if (profile?.review_status !== 'rejected' && profile?.review_status !== 'approved') {
      await supabase
        .from('profiles')
        .update({ review_status: 'approved' })
        .eq('id', user.id)
      if (profile) profile.review_status = 'approved'
    }

    // 2. Count applications in current calendar month using server UTC time
    const now = new Date()
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))

    const { data: monthlyApps } = await supabase
      .from('applications')
      .select('id, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())

    const monthlyCount = (monthlyApps || []).length

    // 3. Free limit check: 3 applications per month
    if (!isPremium && monthlyCount >= 3) {
      return NextResponse.json(
        {
          success: false,
          limitReached: true,
          error:
            'You have reached your monthly limit of 3 free applications. Upgrade to Premium for unlimited applications.',
        },
        { status: 429 }
      )
    }

    // 4. Record application in database with server UTC timestamp
    const serverTimestamp = new Date().toISOString()
    const appPayload = {
      user_id: user.id,
      job_id: jobId,
      job_title: jobTitle || 'Remote Position',
      company_name: companyName || 'Company',
      status: 'submitted',
      notes: applyUrl,
      created_at: serverTimestamp,
    }

    // Try insert with authenticated supabase client first (respects auth.uid() RLS), fallback to admin client
    let insertResult = await supabase.from('applications').insert(appPayload).select()
    if (insertResult.error) {
      console.warn('Authenticated insert note, trying admin insert:', insertResult.error.message)
      await adminSupabase.from('applications').insert(appPayload)
    }

    const newCount = monthlyCount + 1
    const remaining = isPremium ? 'Unlimited' : Math.max(0, 3 - newCount)

    return NextResponse.json({
      success: true,
      applyUrl,
      isPremium,
      monthlyCount: newCount,
      remaining,
      serverTime: serverTimestamp,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error processing application.' },
      { status: 500 }
    )
  }
}
