import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { extractSkillsFromText } from '@/utils/matching'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId } = await req.json()

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Missing target jobId' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // 1. Fetch User Profile & Entitlements
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found. Please upload CV first.' }, { status: 404 })
    }

    // 2. Fetch Target Job
    const { data: job } = await adminSupabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .maybeSingle()

    if (!job) {
      return NextResponse.json({ success: false, error: 'Target job not found' }, { status: 404 })
    }

    // 3. Entitlement & Credit Check
    const isPro = Boolean(profile.is_premium)
    let canProceed = false
    let reason = ''

    if (isPro) {
      canProceed = true
      reason = 'pro_subscription'
    } else if (!profile.free_tailor_used) {
      canProceed = true
      reason = 'free_trial'
    } else {
      // Check credit ledger
      const { data: credits } = await adminSupabase
        .from('credit_ledger')
        .select('*')
        .eq('user_id', user.id)
        .eq('kind', 'tailor_cv')

      const totalCredits = (credits || []).reduce((acc, c) => acc + c.delta, 0)
      if (totalCredits > 0) {
        canProceed = true
        reason = 'credit'
      }
    }

    if (!canProceed) {
      return NextResponse.json(
        {
          success: false,
          requiresPayment: true,
          error: 'You have used your free tailored CV trial. Upgrade to Pro or buy 1 tailored CV for ₦700.',
        },
        { status: 402 }
      )
    }

    // 4. Generate Tailored CV Snapshot
    const jobSkills = extractSkillsFromText(`${job.title} ${job.description} ${job.requirements || ''}`)
    const userSkills = profile.skills || []
    const combinedSkills = Array.from(new Set([...userSkills, ...jobSkills.slice(0, 3)]))

    const tailoredSummary = `Results-driven ${profile.target_roles?.[0] || job.title} with proven expertise in ${userSkills.slice(0, 3).join(', ')}. Specially tailored for the ${job.title} role at ${job.company_name}, bringing targeted problem-solving, rapid execution, and collaborative excellence.`

    const tailoredExperience = (profile.experience || []).map((exp: any) => ({
      ...exp,
      description: `${exp.description || ''} Applied ${jobSkills.slice(0, 2).join(' and ')} best practices to enhance team output and operational efficiency.`,
    }))

    const tailoredContent = {
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      city: profile.city,
      target_job_title: job.title,
      target_company: job.company_name,
      summary: tailoredSummary,
      skills: combinedSkills,
      experience: tailoredExperience,
      education: profile.education,
      links: profile.links,
    }

    // 5. Save to cv_versions table
    const { data: cvVersion, error: cvErr } = await adminSupabase
      .from('cv_versions')
      .insert({
        user_id: user.id,
        job_id: job.id,
        kind: 'tailored',
        title: `Tailored for ${job.title} at ${job.company_name}`,
        content: tailoredContent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    // 6. Deduct credit or mark free trial as used
    if (reason === 'free_trial') {
      await adminSupabase
        .from('profiles')
        .update({ free_tailor_used: true })
        .eq('id', user.id)
    } else if (reason === 'credit') {
      await adminSupabase.from('credit_ledger').insert({
        user_id: user.id,
        kind: 'tailor_cv',
        delta: -1,
        reason: 'used_on_job',
        ref: job.id,
        balance_after: 0,
        created_at: new Date().toISOString(),
      })
    }

    // 7. Log AI usage
    try {
      await adminSupabase.from('ai_usage').insert({
        user_id: user.id,
        feature: 'cv_tailor',
        model: 'deterministic-tailor',
        prompt_tokens: 300,
        completion_tokens: 250,
        cost_estimate_usd: 0.0001,
        success: true,
        created_at: new Date().toISOString(),
      })
    } catch {}

    return NextResponse.json({
      success: true,
      cvVersion,
      message: `Tailored CV generated for ${job.title}! Saved in your CV snapshots.`,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error tailoring CV' },
      { status: 500 }
    )
  }
}

