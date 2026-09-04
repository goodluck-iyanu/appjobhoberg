import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const adminSupabase = createAdminClient()

    const { error } = await adminSupabase.from('employer_posts').insert({
      company_name: data.company_name,
      company_email: data.company_email,
      job_title: data.job_title,
      job_description: data.job_description,
      location: data.location,
      work_type: data.work_type,
      salary_range: data.salary_range || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    })

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error submitting post' },
      { status: 500 }
    )
  }
}

