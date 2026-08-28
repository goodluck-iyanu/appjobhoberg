'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Clock,
  Crown,
  Lock,
  Sparkles,
  Zap,
} from '@/components/icons'

interface ApplySectionProps {
  job: {
    id: string
    title: string
    company_name: string
    apply_url: string
  }
  user: {
    id: string
    email?: string
  } | null
  reviewStatus: 'draft' | 'under_review' | 'approved' | 'rejected'
  isPremium: boolean
  initialMonthlyCount: number
}

export default function ApplySection({
  job,
  user,
  reviewStatus,
  isPremium,
  initialMonthlyCount,
}: ApplySectionProps) {
  const [monthlyCount, setMonthlyCount] = useState(initialMonthlyCount)
  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const isLimitReached = !isPremium && monthlyCount >= 3

  const handleApplyClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/applications/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: job.title,
          companyName: job.company_name,
          applyUrl: job.apply_url,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setApplied(true)
        if (!isPremium) {
          setMonthlyCount((prev) => prev + 1)
        }
        // Open official employer portal in a new tab
        window.open(job.apply_url, '_blank', 'noopener,noreferrer')
      } else {
        if (data.limitReached) {
          setMonthlyCount(3)
        }
        setErrorMsg(data.error || 'Failed to initiate application.')
      }
    } catch {
      window.open(job.apply_url, '_blank', 'noopener,noreferrer')
    } finally {
      setLoading(false)
    }
  }

  // 1. Not Logged In
  if (!user) {
    return (
      <div className="bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-3xl p-6 sm:p-8 text-center">
        <h3 className="text-[18px] font-bold text-[#1d1d1f] mb-2">
          Sign in to apply for this role at {job.company_name}
        </h3>
        <p className="text-[14px] text-[#86868b] mb-6 max-w-md mx-auto">
          Create a free account with Google to build your verified profile and get 3 free monthly applications.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold px-8 py-3.5 rounded-full transition-colors text-[15px] shadow-sm cursor-pointer"
        >
          Sign in with Google
        </Link>
      </div>
    )
  }

  // 2. Profile Under Review
  if (reviewStatus === 'under_review') {
    return (
      <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-6 sm:p-8 text-center">
        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-[18px] font-bold text-amber-950 mb-1">
          Profile Under Review
        </h3>
        <p className="text-[14px] text-amber-900/90 mb-6 max-w-md mx-auto leading-relaxed">
          Our team is currently reviewing your professional profile. Usually reviewed within 24 hours. Once verified, you will be able to apply to all remote positions immediately.
        </p>
        <Link
          href="/profile"
          className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-[#1d1d1f] font-semibold px-8 py-3 rounded-full border border-gray-300 transition-colors text-[14px] shadow-sm"
        >
          View Review Status
        </Link>
      </div>
    )
  }

  // 3. Profile Not Submitted / Incomplete
  if (reviewStatus !== 'approved') {
    return (
      <div className="bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-3xl p-6 sm:p-8 text-center">
        <div className="w-12 h-12 bg-gray-200 text-[#1d1d1f] rounded-2xl flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-[18px] font-bold text-[#1d1d1f] mb-1">
          Complete &amp; Submit Your Profile
        </h3>
        <p className="text-[14px] text-[#86868b] mb-6 max-w-md mx-auto leading-relaxed">
          Before applying for opportunities, submit your verified career profile for Hoberg review.
        </p>
        <Link
          href="/profile"
          className="inline-flex items-center justify-center bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold px-8 py-3.5 rounded-full transition-colors text-[15px] shadow-sm cursor-pointer"
        >
          Complete Profile &amp; Submit
        </Link>
      </div>
    )
  }

  // 4. Approved, BUT FREE LIMIT REACHED (3 of 3 used) -> BLURRED LOCKED PREMIUM GATE
  if (isLimitReached) {
    return (
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/80 bg-gradient-to-br from-amber-500/10 via-white to-red-500/10 p-8 sm:p-10 text-center shadow-xl">
        {/* Background Decorative Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-amber-500/20">
            <Crown className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[12px] font-extrabold uppercase tracking-wider mb-3">
            <Lock className="w-3.5 h-3.5" />
            Monthly Free Limit Reached (3/3 Used)
          </div>

          <h3 className="text-[20px] sm:text-[24px] font-black text-[#1d1d1f] tracking-tight mb-2">
            Unlock Unlimited Job Applications
          </h3>

          <p className="text-[14px] sm:text-[15px] text-[#86868b] max-w-lg mx-auto mb-6 leading-relaxed">
            You&apos;ve used all <strong className="text-[#1d1d1f]">3 of your free applications</strong> for this calendar month. Upgrade to <strong className="text-[#e02424]">Hoberg Premium</strong> to apply for unlimited remote jobs, skip the queue, and access exclusive high-paying roles.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <Link
              href="/premium"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center bg-gradient-to-r from-amber-500 via-orange-500 to-[#e02424] hover:opacity-95 text-white font-bold px-8 py-4 rounded-full transition-all text-[15px] shadow-lg shadow-orange-500/25 cursor-pointer gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Upgrade to Premium &bull; ₦4,000/mo</span>
            </Link>
          </div>

          <p className="text-[12px] text-[#86868b] mt-3">
            Founding Member Rate: 20% OFF &bull; Renews monthly &bull; Cancel anytime
          </p>
        </div>
      </div>
    )
  }

  // 5. Approved Candidate with Applications Remaining or Premium Active
  return (
    <div className="bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-3xl p-6 sm:p-8 text-center relative">
      <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
        <CheckCircle className="w-6 h-6" />
      </div>

      <h3 className="text-[18px] font-bold text-[#1d1d1f] mb-1">
        You are verified &amp; ready to apply!
      </h3>

      <p className="text-[14px] text-[#86868b] mb-6 max-w-md mx-auto">
        Click below to submit your application on the official {job.company_name} portal.
      </p>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl max-w-md mx-auto">
          {errorMsg}
        </div>
      )}

      <button
        type="button"
        onClick={handleApplyClick}
        disabled={loading}
        className="inline-flex items-center justify-center bg-[#e02424] hover:bg-[#c81e1e] active:bg-[#991b1b] text-white font-bold px-8 py-4 rounded-full transition-all text-[15px] shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer gap-2"
      >
        <span>{loading ? 'Opening Application Portal...' : 'Apply on Official Site'}</span>
        <ExternalLink className="w-4 h-4" />
      </button>

      {/* Application Usage Counter Pill */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {isPremium ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[12px] font-bold">
            <Crown className="w-3.5 h-3.5 text-amber-700" />
            <span>Premium Member &bull; Unlimited Applications</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#d2d2d7]/70 text-[#1d1d1f] text-[12px] font-medium shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#e02424]" />
            <span>
              Monthly Allowance: <strong>{monthlyCount} of 3 free applications used</strong> ({Math.max(0, 3 - monthlyCount)} remaining)
            </span>
          </span>
        )}
      </div>
    </div>
  )
}

