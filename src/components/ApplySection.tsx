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
  Crown,
} from '@/components/icons'
import { useToast } from '@/components/Toast'

interface ApplySectionProps {
  jobId: string
  jobTitle: string
  companyName: string
  applyUrl: string
  isLoggedIn: boolean
  isPremium?: boolean
  matchResult?: any
}

export default function ApplySection({
  jobId,
  jobTitle,
  companyName,
  applyUrl,
  isLoggedIn,
  isPremium,
  matchResult,
}: ApplySectionProps) {
  const [applied, setApplied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tailoring, setTailoring] = useState(false)
  const [tailoredVersion, setTailoredVersion] = useState<any>(null)
  const toast = useToast()

  const targetUrl =
    applyUrl && applyUrl.startsWith('http')
      ? applyUrl
      : applyUrl?.includes('@')
      ? `mailto:${applyUrl}`
      : `https://${applyUrl || 'hoberg.com.ng'}`

  const handleTailorCv = async () => {
    setTailoring(true)
    try {
      const res = await fetch('/api/cv/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })
      const data = await res.json()
      
      if (res.status === 402) {
        toast.error('Out of Credits', data.error)
      } else if (!data.success) {
        toast.error('Error', data.error || 'Failed to tailor CV')
      } else {
        toast.success('Tailored successfully!', 'Your CV was tailored and one credit was deducted.')
        setTailoredVersion(data.cvVersion)
      }
    } catch {
      toast.error('Error', 'A network error occurred.')
    } finally {
      setTailoring(false)
    }
  }

  const handleDownloadPdf = (versionId: string) => {
    // In a real app, this might redirect to a /api/cv/download?id=... route
    toast.success('Downloading...', 'Your PDF is being prepared.')
    setTimeout(() => {
      window.open(`/api/cv/pdf?id=${versionId}`, '_blank')
    }, 1000)
  }

  const handleTailoredApply = async () => {
    // Use the tailored version for the application tracker
    setApplied(true)
    if (isLoggedIn) {
      try {
        await fetch('/api/applications/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId,
            jobTitle,
            companyName,
            applyUrl: targetUrl,
            cvVersionId: tailoredVersion?.id,
          }),
        })
        toast.success('Application Tracked! 📋', 'Saved with your Tailored CV.')
      } catch {}
    }
  }

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

      {/* Match Breakdown & Tailor CV Section */}
      {isLoggedIn && matchResult && (
        <div className="bg-white border border-black/[0.06] shadow-sm p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2.5 h-2.5 rounded-full ${matchResult.score >= 80 ? 'bg-emerald-500' : matchResult.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} />
                <h3 className="font-bold text-[16px] text-[#1d1d1f]">
                  {matchResult.score}% Profile Match
                </h3>
              </div>
              <p className="text-[13px] text-[#86868b]">{matchResult.reason}</p>
            </div>
            
            {/* Free vs Pro display */}
            {!isPremium ? (
              <div className="shrink-0 text-right">
                <Link href="/pricing" className="text-[13px] font-semibold text-[#0066cc] hover:underline flex items-center justify-end gap-1">
                  <Crown className="w-4 h-4" />
                  Upgrade to see missing keywords
                </Link>
              </div>
            ) : (
              <div className="shrink-0">
                {!tailoredVersion ? (
                  <button 
                    onClick={handleTailorCv}
                    disabled={tailoring}
                    className="inline-flex items-center justify-center gap-1.5 bg-[#0066cc] hover:bg-[#0055b3] active:scale-[0.98] text-white px-4 py-2 text-[13px] font-semibold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    {tailoring ? 'Tailoring...' : 'Tailor CV for this job'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadPdf(tailoredVersion.id)}
                      className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 text-[12px] font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={handleTailoredApply}
                      disabled={applied}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-[12px] font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {applied ? 'Applied' : 'Mark as Applied'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Missing Keywords (Pro only) */}
          {isPremium && matchResult.missing_keywords && matchResult.missing_keywords.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-2">Missing Keywords</p>
              <div className="flex flex-wrap gap-2">
                {matchResult.missing_keywords.map((kw: string) => (
                  <span key={kw} className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 text-[12px] font-medium rounded-md">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
