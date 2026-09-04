import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'

const ADMIN_TOKEN = 'hoberg_admin_secure_session_token_2026'

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hoberg_admin_token')?.value

  if (token !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    // 1. Fetch all open jobs to shuffle
    const { data: dbJobs, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open')

    if (fetchError) throw fetchError

    if (dbJobs && dbJobs.length > 0) {
      // 2. Randomly shuffle the jobs
      const shuffled = shuffleArray(dbJobs)

      // 3. Assign new descending timestamps so they appear in this new order
      const now = Date.now()
      const updates = shuffled.map((job, index) => ({
        ...job,
        created_at: new Date(now - index * 60000).toISOString(),
        posted_at: new Date(now - index * 60000).toISOString(),
      }))

      // 4. Update them in chunks of 50 for speed and stability
      const chunkSize = 50
      const chunkPromises = []
      for (let i = 0; i < updates.length; i += chunkSize) {
        const chunk = updates.slice(i, i + chunkSize)
        chunkPromises.push(
          supabase.from('jobs').upsert(chunk, { onConflict: 'id' }).then((res) => {
            if (res.error) throw new Error(res.error.message)
            return res
          })
        )
      }
      await Promise.all(chunkPromises)
    }

    // 5. Instantly invalidate Next.js caches
    try {
      revalidatePath('/', 'layout')
      revalidatePath('/', 'page')
      revalidatePath('/jobs', 'page')
      revalidatePath('/dashboard', 'page')
      revalidatePath('/aadminn', 'page')
    } catch {}

    return NextResponse.json({
      success: true,
      shuffledCount: dbJobs?.length || 0,
      message: `Successfully shuffled ${dbJobs?.length || 0} jobs across all categories!`,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to shuffle jobs.' },
      { status: 500 }
    )
  }
}
