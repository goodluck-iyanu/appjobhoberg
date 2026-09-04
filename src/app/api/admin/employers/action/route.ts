import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/utils/supabase/admin'

const ADMIN_TOKEN = 'hoberg_admin_secure_session_token_2026'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('hoberg_admin_token')?.value

  if (token !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 })
  }

  try {
    const { action, postId, reportId, jobId } = await req.json()
    const supabase = createAdminClient()

    if (action === 'approve_post' && postId) {
      // 1. Fetch the post
      const { data: post, error: fetchError } = await supabase
        .from('employer_posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (fetchError || !post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }

      // 2. Insert into jobs
      const { error: insertError } = await supabase.from('jobs').insert({
        title: post.title,
        company_name: post.company_name,
        location: 'Nigeria (Remote)',
        employment_type: post.employment_type,
        salary_range: post.salary_range,
        description: post.description,
        requirements: post.requirements,
        apply_url: post.application_url || `mailto:${post.employer_email}`,
        source: 'Nigerian Employer (Curated)',
        category: 'General',
        is_featured: true,
      })

      if (insertError) {
        return NextResponse.json({ error: 'Failed to insert job' }, { status: 500 })
      }

      // 3. Delete from employer_posts
      await supabase.from('employer_posts').delete().eq('id', postId)

      return NextResponse.json({ success: true })
    }

    if (action === 'reject_post' && postId) {
      const { error } = await supabase.from('employer_posts').delete().eq('id', postId)
      if (error) {
        return NextResponse.json({ error: 'Failed to reject post' }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'remove_job' && reportId && jobId) {
      // 1. Delete the job
      await supabase.from('jobs').delete().eq('id', jobId)
      // 2. Delete the report
      await supabase.from('job_reports').delete().eq('id', reportId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

