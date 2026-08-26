import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

const ADMIN_TOKEN = 'hoberg_admin_secure_session_token_2026'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hoberg_admin_token')?.value

  if (token !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    // Fetch all user profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const users = profiles || []

    // Calculate live overview metrics
    const totalUsers = users.length
    const underReview = users.filter((u) => u.review_status === 'under_review').length
    const approved = users.filter((u) => u.review_status === 'approved').length
    const draft = users.filter((u) => !u.review_status || u.review_status === 'draft').length
    const rejected = users.filter((u) => u.review_status === 'rejected').length
    const premiumUsers = users.filter((u) => u.is_premium).length
    const freeUsers = totalUsers - premiumUsers

    // Calculate revenue (Founding member rate: ₦4,000 per user)
    const estimatedRevenue = premiumUsers * 4000

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers,
        underReview,
        approved,
        draft,
        rejected,
        premiumUsers,
        freeUsers,
        estimatedRevenue,
      },
      users,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch users' }, { status: 500 })
  }
}
