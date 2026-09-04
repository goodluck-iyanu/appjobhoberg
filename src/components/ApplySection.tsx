'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Bookmark,
} from '@/components/icons'
import { useToast } from '@/components/Toast'

interface ApplySectionProps {
  jobId: string
  jobTitle: string
  companyName: string
  applyUrl: string
  isLoggedIn: boolean
}

export default function ApplySection({
  jobId,
  jobTitle,
  companyName,
  applyUrl,
  isLoggedIn,
}: ApplySectionProps) {
  const [applied, setApplied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const targetUrl =
    applyUrl && applyUrl.startsWith('http')
      ? applyUrl
      : applyUrl?.includes('@')
      ? `mailto:${applyUrl}`
      : `https://${applyUrl || 'hoberg.com.ng'}`

  const handleApply = async () => {
    // 1. Open official application page immediately in a new tab
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
    setApplied(true)

    // 2. If logged in, record in application tracker
    if (isLoggedIn) {
      setLoading(true)
      try {
        const res = await fetch('/api/applications/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId,
            jobTitle,
            companyName,
            applyUrl: targetUrl,
          }),
        })
        const data = await res.json()
        if (data.success) {
          toast.success('Application Tracked! 📋', `Added ${jobTitle} to your tracker pipeline.`)
        }
      } catch {
        // Quiet fail — user already opened the target URL
      } finally {
        setLoading(false)
      }
    } else {
      toast.info('Application Opened', 'Tip: Sign in with Google to automatically track all your job applications.')
    }
  }

  const handleSaveJob = async () => {
    if (!isLoggedIn) {
      toast.info('Sign in to Save', 'Create a free account to save jobs and track your applications.')
      return
    }

    try {
      const res = await fetch('/api/applications/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          jobTitle,
          companyName,
          applyUrl: targetUrl,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSaved(!saved)
        toast.success(saved ? 'Job Removed' : 'Job Saved! 📌', saved ? 'Removed from saved jobs.' : 'Saved to your tracker.')
      }
    } catch {
      toast.error('Error', 'Could not save job.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Primary Action Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Main Apply Button (Always Active, Always Free) */}
        <button
          type="button"
          onClick={handleApply}
          className={`flex-1 flex items-center justify-center gap-2 font-semibold text-[15px] px-8 py-4 rounded-2xl transition-all shadow-sm cursor-pointer ${
            applied
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-[#e02424] hover:bg-[#c81e1e] active:scale-[0.99] text-white'
          }`}
        >
          {applied ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Applied ✓ (Tracked in Pipeline)</span>
            </>
          ) : (
            <>
              <span>Apply on Official Site</span>
              <ExternalLink className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSaveJob}
          className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border text-[14px] font-semibold transition-all cursor-pointer ${
            saved
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-white hover:bg-gray-50 border-[#d2d2d7] text-[#1d1d1f]'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-amber-500 text-amber-500' : ''}`} />
          <span>{saved ? 'Saved' : 'Save Job'}</span>
        </button>
      </div>

      {/* Trust & Charter Microcopy */}
      <div className="flex items-center justify-between text-[12px] text-[#86868b] px-1">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% Free Application • No limits</span>
        </div>
        {isLoggedIn && (
          <Link href="/app/tracker" className="text-[#e02424] font-medium hover:underline flex items-center gap-1">
            <span>View Tracker</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  )
}
