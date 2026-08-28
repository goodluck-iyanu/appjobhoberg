import { createAdminClient } from '@/utils/supabase/admin'

export interface AuthLogEntry {
  id?: string
  user_id: string
  user_email: string
  user_name?: string
  event_type: 'login' | 'logout'
  ip_address?: string
  user_agent?: string
  created_at?: string
}

/**
 * Log an authentication event (login or logout) for audit & security tracking
 */
export async function logAuthActivity({
  userId,
  userEmail,
  userName,
  eventType,
  ipAddress,
  userAgent,
}: {
  userId: string
  userEmail: string
  userName?: string
  eventType: 'login' | 'logout'
  ipAddress?: string
  userAgent?: string
}) {
  try {
    const supabase = createAdminClient()

    // 1. Insert into auth_logs table
    await supabase.from('auth_logs').insert({
      user_id: userId,
      user_email: userEmail,
      user_name: userName || userEmail.split('@')[0],
      event_type: eventType,
      ip_address: ipAddress || 'Unknown IP',
      user_agent: userAgent || 'Browser',
      created_at: new Date().toISOString(),
    })

    // 2. Update user's last_active timestamp in profiles
    if (eventType === 'login') {
      await supabase
        .from('profiles')
        .update({
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
    } else if (eventType === 'logout') {
      await supabase
        .from('profiles')
        .update({
          last_logout_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
    }
  } catch (err) {
    // Fail-safe: don't break auth flow if logging table is pending migration
    console.error('Failed to log auth activity:', err)
  }
}
