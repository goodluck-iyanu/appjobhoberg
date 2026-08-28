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
        { success: false, error: 'You must be signed in to apply.' },
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

    // 1. Fetch user's profile to verify review_status and premium status
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('review_status, is_premium, full_name, email')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found.' },
        { status: 404 }
      )
    }

    if (profile.review_status !== 'approved') {
      return NextResponse.json(
        {
          success: false,
          error:
            profile.review_status === 'under_review'
              ? 'Your profile is currently under review.'
              : 'Your profile must be completed and approved before applying.',
        },
        { status: 403 }
      )
    }

    const isPremium = Boolean(profile.is_premium)

    // 2. Count applications in the current calendar month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: monthlyApps, error: appsError } = await adminSupabase
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

    // 4. Record the application
    const { error: insertError } = await adminSupabase.from('applications').insert({
      user_id: user.id,
      job_id: jobId,
      job_title: jobTitle || 'Remote Position',
      company_name: companyName || 'Company',
      apply_url: applyUrl,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error('Failed to log application:', insertError)
    }

    const newCount = monthlyCount + 1
    const remaining = isPremium ? 'Unlimited' : Math.max(0, 3 - newCount)

    return NextResponse.json({
      success: true,
      applyUrl,
      isPremium,
      monthlyCount: newCount,
      remaining,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error processing application.' },
      { status: 500 }
    )
  }
}
