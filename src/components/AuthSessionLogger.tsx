'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AuthSessionLogger() {
  useEffect(() => {
    const supabase = createClient()

    // 1. Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user = session.user
        const sessionKey = `hoberg_login_logged_${user.id}_${new Date().toDateString()}`
        const alreadyLogged = sessionStorage.getItem(sessionKey)

        if (!alreadyLogged) {
          sessionStorage.setItem(sessionKey, 'true')
          fetch('/api/auth/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              userEmail: user.email,
              userName:
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split('@')[0],
              eventType: 'login',
            }),
          }).catch(() => {})
        }
      }
    })

    // 2. Listen for SIGNED_IN events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user
        const sessionKey = `hoberg_login_logged_${user.id}_${new Date().toDateString()}`
        const alreadyLogged = sessionStorage.getItem(sessionKey)

        if (!alreadyLogged) {
          sessionStorage.setItem(sessionKey, 'true')
          fetch('/api/auth/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              userEmail: user.email,
              userName:
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split('@')[0],
              eventType: 'login',
            }),
          }).catch(() => {})
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return null
}

