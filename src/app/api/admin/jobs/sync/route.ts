import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'
import { fetchLiveJobs } from '@/utils/jobs'

const ADMIN_TOKEN = 'hoberg_admin_secure_session_token_2026'

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hoberg_admin_token')?.value

  if (token !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    // 1. Fetch fresh jobs from all live providers & curated lists
    const liveJobs = await fetchLiveJobs()

    // 2. Wipe ALL old external remote jobs so the site is instantly refreshed with ONLY active jobs
    // This removes old API jobs but keeps any 'internal' jobs manually created by the admin
    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .neq('source', 'internal')

    if (deleteError) {
      console.warn('Could not wipe old jobs:', deleteError.message)
    }

    // 3. Prepare fresh jobs that need to be inserted into the platform database
    const jobsToInsert: any[] = []
    const now = new Date().toISOString()
    const seen = new Set<string>()

    for (const j of liveJobs) {
      const key = `${(j.title || '').toLowerCase().trim()}___${(j.company_name || '').toLowerCase().trim()}`
      if (!seen.has(key)) {
        jobsToInsert.push({
          title: j.title,
          company_name: j.company_name,
          company_logo_url: j.company_logo_url || null,
          location: j.location || 'Remote',
          employment_type: j.employment_type || 'Full-time',
          is_remote: true,
          salary_range: j.salary_range || 'Competitive',
          category: j.category || 'General',
          description: j.description || `${j.title} position at ${j.company_name}. Apply on official site.`,
          requirements: j.requirements || '',
          apply_url: j.apply_url && j.apply_url.startsWith('http') ? j.apply_url : `https://${j.apply_url || 'hoberg.com.ng'}`,
          status: 'open',
          source: j.source || 'Aggregated Feed',
          created_at: now, // Newest timestamp puts fresh jobs at the top of listings
        })
        seen.add(key)
      }
    }

    let insertedCount = 0
    if (jobsToInsert.length > 0) {
      // Insert in chunks of 50
      const chunkSize = 50
      for (let i = 0; i < jobsToInsert.length; i += chunkSize) {
        const chunk = jobsToInsert.slice(i, i + chunkSize)
        const { data, error: insertError } = await supabase.from('jobs').insert(chunk).select('id')
        if (insertError) {
          console.error('Failed to insert job chunk:', insertError.message)
        } else {
          insertedCount += (data || []).length
        }
      }
    }

    // 4. Revalidate pages across the platform
    try {
      revalidatePath('/')
      revalidatePath('/jobs')
      revalidatePath('/dashboard')
    } catch {}

    // 5. Query total jobs in database
    const { count: totalDbCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      newJobsAdded: insertedCount,
      totalSynced: liveJobs.length,
      totalInDatabase: totalDbCount || insertedCount,
      message: `Refresh complete! Wiped old remote jobs and added ${insertedCount} fresh jobs. Total records: ${totalDbCount || insertedCount}.`,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to sync jobs.' },
      { status: 500 }
    )
  }
}

