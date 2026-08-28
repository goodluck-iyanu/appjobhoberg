'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, Crown, ExternalLink } from '@/components/icons'
import { createClient } from '@/utils/supabase/client'

interface ApplyHeaderButtonProps {
  user: {
    id: string
  } | null
  reviewStatus: string
  isPremium: boolean
  monthlyCount: number
}

export default function ApplyHeaderButton({
  user,
  reviewStatus,
  isPremium,
  monthlyCount,
}: ApplyHeaderButtonProps) {
  const [isPremiumState, setIsPremiumState] = useState(isPremium)

  // Real-time bypass of Next.js Router cache
  useEffect(() => {
    if (!user || isPremiumState) return

    const checkPremiumStatus = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', user.id)
          .maybeSingle()

        if (data?.is_premium) {
          setIsPremiumState(true)
        }
      } catch {}
    }

    checkPremiumStatus()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkPremiumStatus()
      }
    }

    window.addEventListener('focus', checkPremiumStatus)
    document.addEventListener('visibilitychange', handleVisibility)

    const interval = setInterval(checkPremiumStatus, 3000)

    return () => {
      window.removeEventListener('focus', checkPremiumStatus)
      document.removeEventListener('visibilitychange', handleVisibility)
      clearInterval(interval)
    }
  }, [user, isPremiumState])

  const isLimitReached = !isPremiumState && monthlyCount >= 3

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className="inline-flex items-center justify-center bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold px-6 py-3 rounded-full transition-colors text-[15px] shadow-sm cursor-pointer"
        >
          Sign in with Google to Apply
        </Link>
        <p className="text-[12px] text-[#86868b] mt-2 text-center sm:text-right">
          Account &amp; profile verification required
        </p>
      </>
    )
  }

  if (!isPremiumState && reviewStatus === 'under_review') {
    return (
      <Link
        href="/profile"
        className="inline-flex items-center justify-center bg-amber-50 border border-amber-300 text-amber-900 font-semibold px-5 py-2.5 rounded-full transition-colors text-[14px] shadow-sm"
      >
        <Clock className="w-4 h-4 mr-2 text-amber-700" />
        <span>Profile Under Review</span>
      </Link>
    )
  }

  if (!isPremiumState && reviewStatus !== 'approved') {
    return (
      <Link
        href="/profile"
        className="inline-flex items-center justify-center bg-[#1d1d1f] hover:bg-black text-white font-semibold px-6 py-3 rounded-full transition-colors text-[14px] shadow-sm"
      >
        <span>Complete Profile to Apply</span>
      </Link>
    )
  }

  if (isLimitReached) {
    return (
      <Link
        href="/premium"
        className="inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-[#e02424] text-white font-bold px-6 py-3 rounded-full transition-all text-[14px] shadow-md gap-1.5"
      >
        <Crown className="w-4 h-4 text-amber-200" />
        <span>Upgrade (Limit Reached: 3/3)</span>
      </Link>
    )
  }

  return (
    <a
      href="#apply-section"
      className="inline-flex items-center justify-center bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold px-6 py-3 rounded-full transition-colors text-[15px] shadow-sm cursor-pointer gap-2"
    >
      <span>Apply on Official Site</span>
      <ExternalLink className="w-4 h-4" />
    </a>
  )
}
