import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'

const ADMIN_TOKEN = 'hoberg_admin_secure_session_token_2026'

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hoberg_admin_token')?.value

  if (token !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    // 1. Fetch all jobs to shuffle (fetch ALL columns to safely upsert)
    const { data: dbJobs, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open')

    if (fetchError) throw fetchError

    if (dbJobs && dbJobs.length > 0) {
      // 2. Randomly shuffle the jobs array
      dbJobs.sort(() => Math.random() - 0.5)

      // 3. Assign new descending timestamps so they appear in this new order
      // We start from 'now' and space them out by 10 minutes each
      const now = Date.now()
      const updates = dbJobs.map((job, index) => ({
        ...job,
        created_at: new Date(now - index * 600000).toISOString(),
      }))

      // 4. Update them in the database
      const { error: updateError } = await supabase
        .from('jobs')
        .upsert(updates) // Safe because we fetched all columns

      if (updateError) {
        console.warn('Upsert issue during shuffle:', updateError.message)
      }
    }

    // 5. Revalidate paths so Next.js server components re-evaluate
    try {
      revalidatePath('/')
      revalidatePath('/jobs')
      revalidatePath('/dashboard')
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Job feed display order successfully rotated and shuffled across all industries!',
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to shuffle jobs.' },
      { status: 500 }
    )
  }
}
