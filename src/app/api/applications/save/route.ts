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
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId, jobTitle, companyName, applyUrl, location, salaryRange } = await req.json()
    const adminSupabase = createAdminClient()
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jobId || '')

    // Check if already saved
    let checkQuery = supabase.from('saved_jobs').select('id').eq('user_id', user.id)
    if (isUuid) {
      checkQuery = checkQuery.eq('job_id', jobId)
    } else {
      checkQuery = checkQuery.eq('job_title', jobTitle)
    }

    const { data: existing } = await checkQuery.maybeSingle()

    if (existing) {
      // Remove save
      await supabase.from('saved_jobs').delete().eq('id', existing.id)
      return NextResponse.json({ success: true, saved: false })
    }

    // Insert new save
    const payload = {
      user_id: user.id,
      job_id: isUuid ? jobId : null,
      job_title: jobTitle,
      company_name: companyName || 'Company',
      location: location || 'Remote',
      salary_range: salaryRange || 'Competitive',
      apply_url: applyUrl || 'https://jobs.hoberg.com.ng',
      created_at: new Date().toISOString(),
    }

    const { error: insertErr } = await supabase.from('saved_jobs').insert(payload)
    if (insertErr) {
      await adminSupabase.from('saved_jobs').insert(payload)
    }

    return NextResponse.json({ success: true, saved: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

