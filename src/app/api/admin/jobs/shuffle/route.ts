import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

const ADMIN_TOKEN = 'hoberg_admin_secure_session_token_2026'

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hoberg_admin_token')?.value

  if (token !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 })
  }

  try {
    // Revalidate paths so Next.js server components re-evaluate smartShuffleJobs
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
