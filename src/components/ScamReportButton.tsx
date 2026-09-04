'use client'

import { useState } from 'react'
import { AlertCircle, X, CheckCircle } from '@/components/icons'
import { useToast } from '@/components/Toast'

interface ScamReportButtonProps {
  jobId: string
  jobTitle: string
}

export default function ScamReportButton({ jobId, jobTitle }: ScamReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState('apply_fee')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/jobs/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          jobTitle,
          reason,
          details,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Report Submitted', 'Thank you. Our moderation team has flagged this post for review.')
        setIsOpen(false)
      } else {
        toast.error('Error', data.error || 'Could not submit report.')
      }
    } catch {
      toast.error('Network Error', 'Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#86868b] hover:text-red-600 transition-colors cursor-pointer"
      >
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Report Job</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-200 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-[16px] text-[#1d1d1f]">Report Job Listing</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[13px] text-[#86868b] mb-4">
              Help keep Hoberg Jobs safe for Nigerian jobseekers.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1.5">
                  Reason for reporting
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-[13px] bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#1d1d1f]"
                >
                  <option value="apply_fee">Asked for application fee / payment / airtime</option>
                  <option value="fake_company">Fake company / Suspicious contact</option>
                  <option value="doesnt_hire_from_nigeria">Does not hire candidates from Nigeria</option>
                  <option value="expired">Job is already expired / link broken</option>
                  <option value="duplicate">Duplicate listing</option>
                  <option value="other">Other issue</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1.5">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe what happened or paste any suspicious links..."
                  className="w-full text-[13px] bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl p-3 focus:outline-none focus:border-[#1d1d1f]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#86868b] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-[13px] font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 cursor-pointer shadow-xs"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

