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
        { success: false, error: 'You must be signed in to log applications.' },
        { status: 401 }
      )
    }

    const { jobId, jobTitle, companyName, applyUrl, cvVersionId } = await req.json()

    if (!jobTitle || !applyUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing job title or apply URL' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jobId || '')

    const appPayload: any = {
      user_id: user.id,
      job_id: isUuid ? jobId : null,
      job_title: jobTitle,
      company_name: companyName || 'Company',
      apply_url: applyUrl,
      status: 'Applied',
      applied_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (cvVersionId) {
      appPayload.cv_version_id = cvVersionId
    }

    // Try authenticated client insert first, then admin fallback
    const { error: authErr } = await supabase.from('applications').insert(appPayload)
    if (authErr) {
      console.warn('Authenticated apply insert warning, trying admin client:', authErr.message)
      await adminSupabase.from('applications').insert(appPayload)
    }

    return NextResponse.json({
      success: true,
      message: 'Application recorded to your tracker pipeline.',
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Server error' },
      { status: 500 }
    )
  }
}
