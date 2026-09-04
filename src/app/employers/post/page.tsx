'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle } from '@/components/icons'

export default function EmployerPostPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    company_name: '',
    company_email: '',
    job_title: '',
    job_description: '',
    location: '',
    work_type: 'remote',
    salary_range: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/employers/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit post')
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20 bg-[#f5f5f7]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center border border-[#d2d2d7]/50 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-50 mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] mb-3">
            Post Submitted!
          </h1>
          <p className="text-[#86868b] text-[15px] leading-relaxed mb-8">
            Thank you for submitting your job post. Our team will review it shortly. You will receive an email with payment instructions to publish it live.
          </p>
          <Link
            href="/employers"
            className="inline-flex items-center gap-2 text-[#0066cc] font-semibold text-[15px] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Employers
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-[#f5f5f7] py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <Link href="/employers" className="inline-flex items-center gap-1.5 text-sm text-[#86868b] hover:text-[#1d1d1f] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#d2d2d7]/50 shadow-sm">
          <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Post a Job</h1>
          <p className="text-[#86868b] mb-8">Reach thousands of pre-vetted professionals.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">Company Name</label>
                <input
                  required
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7]/50 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/30 focus:border-[#0066cc]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">Company Email</label>
                <input
                  required
                  type="email"
                  name="company_email"
                  value={formData.company_email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7]/50 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/30 focus:border-[#0066cc]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">Job Title</label>
              <input
                required
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Developer"
                className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7]/50 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/30 focus:border-[#0066cc]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">Work Type</label>
                <select
                  name="work_type"
                  value={formData.work_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7]/50 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/30 focus:border-[#0066cc] appearance-none"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">Location</label>
                <input
                  required
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Lagos, Nigeria or Anywhere"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7]/50 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/30 focus:border-[#0066cc]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">Salary Range (Optional)</label>
              <input
                name="salary_range"
                value={formData.salary_range}
                onChange={handleChange}
                placeholder="e.g. ₦400,000 - ₦600,000 / month"
                className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7]/50 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/30 focus:border-[#0066cc]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">Job Description</label>
              <textarea
                required
                name="job_description"
                value={formData.job_description}
                onChange={handleChange}
                rows={6}
                placeholder="Describe the role, responsibilities, and requirements..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7]/50 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/30 focus:border-[#0066cc] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0066cc] text-white font-semibold text-[15px] px-6 py-3.5 rounded-xl hover:bg-[#0077ed] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Job Post'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

