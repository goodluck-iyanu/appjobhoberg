import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/utils/supabase/admin'

const ADMIN_TOKEN = 'hoberg_admin_secure_session_token_2026'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hoberg_admin_token')?.value

  if (token !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    // 1. Fetch all user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 })
    }

    const users = profiles || []

    // 2. Fetch recent authentication audit logs (logins & logouts)
    let authLogs: any[] = []
    let authLogsError: string | null = null

    try {
      const { data: logs, error: logsError } = await supabase
        .from('auth_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000)

      if (logsError) {
        authLogsError = logsError.message
      } else {
        authLogs = logs || []
      }
    } catch (err: any) {
      authLogsError = err?.message || 'Failed to query auth_logs table'
    }

    // 3. Calculate live overview metrics
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
        totalAuthLogs: authLogs.length,
      },
      users,
      authLogs,
      authLogsError,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch users' }, { status: 500 })
  }
}
