import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { jobId, jobTitle, reason, details } = await req.json()

    if (!jobId || !reason) {
      return NextResponse.json({ success: false, error: 'Missing required report fields' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const adminSupabase = createAdminClient()

    // 1. Insert report record
    try {
      await adminSupabase.from('job_reports').insert({
        job_id: jobId,
        user_id: user?.id || null,
        reason,
        details: details || `Reported for: ${reason} (Job: ${jobTitle || jobId})`,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
    } catch (e: any) {
      console.warn('Report insert warning:', e.message)
    }

    // 2. If reported for scam/fee, increment flag or quarantine
    if (reason === 'apply_fee') {
      try {
        await adminSupabase
          .from('jobs')
          .update({ is_scam_flagged: true })
          .eq('id', jobId)
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: 'Job report received and queued for moderator review.',
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Server error' },
      { status: 500 }
    )
  }
}

