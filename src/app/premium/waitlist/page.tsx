'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Crown, ArrowLeft, CheckCircle, ChevronDown } from '@/components/icons'

const careerFields = [
  'Customer Support & Care',
  'Virtual Assistant & Admin',
  'Writing, SEO & Content',
  'Finance & Accounting',
  'Software & Web Engineering',
  'Product & UI/UX Design',
  'Data & Analytics',
  'Marketing & Growth',
  'Sales & BD',
  'Operations & HR',
  'Other',
]

export default function WaitlistPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    careerField: '',
    skills: '',
    jobInterests: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-50 mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] mb-3">
            You&apos;re on the list!
          </h1>
          <p className="text-[#86868b] text-[15px] leading-relaxed mb-8">
            Thanks, {formData.fullName.split(' ')[0]}! We&apos;ll notify you as soon as Hoberg Premium opens more slots. You&apos;ve locked in the founding member rate (₦4,000/mo).
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#e02424] font-semibold text-[15px] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-12 sm:py-20">
      {/* Back Link */}
      <div className="w-full max-w-lg mb-8">
        <Link
          href="/premium"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#86868b] hover:text-[#1d1d1f] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Premium
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-10 sm:mb-12 max-w-lg">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md mb-6">
          <Crown className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f] mb-3">
          Join the Founding Members
        </h1>
        <p className="text-[#86868b] text-[15px] sm:text-base leading-relaxed">
          Be among the first to experience Hoberg Premium. Founding members get early access and a permanent 20% discount — ₦4,000/month instead of ₦5,000.
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-lg bg-white border border-[#d2d2d7]/60 rounded-2xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7]/50 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b]/60 focus:outline-none focus:ring-2 focus:ring-[#e02424]/30 focus:border-[#e02424] transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7]/50 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b]/60 focus:outline-none focus:ring-2 focus:ring-[#e02424]/30 focus:border-[#e02424] transition-colors"
            />
          </div>

          {/* Career Field */}
          <div>
            <label htmlFor="careerField" className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
              Career Field
            </label>
            <div className="relative">
              <select
                id="careerField"
                name="careerField"
                required
                value={formData.careerField}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7]/50 text-[15px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#e02424]/30 focus:border-[#e02424] transition-colors appearance-none"
              >
                <option value="" disabled>Select your field</option>
                {careerFields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b] pointer-events-none" />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label htmlFor="skills" className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
              Key Skills
            </label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. Virtual Assistance, Customer Support, Writing, React"
              className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7]/50 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b]/60 focus:outline-none focus:ring-2 focus:ring-[#e02424]/30 focus:border-[#e02424] transition-colors"
            />
          </div>

          {/* Job Interests */}
          <div>
            <label htmlFor="jobInterests" className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
              Job Interests
            </label>
            <input
              type="text"
              id="jobInterests"
              name="jobInterests"
              value={formData.jobInterests}
              onChange={handleChange}
              placeholder="e.g. Remote Admin, Customer Care Representative, Content Writer"
              className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7]/50 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b]/60 focus:outline-none focus:ring-2 focus:ring-[#e02424]/30 focus:border-[#e02424] transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#e02424] text-white font-semibold text-[15px] px-6 py-3 rounded-xl hover:bg-[#c81e1e] transition-colors shadow-sm mt-2 cursor-pointer"
          >
            Join the Waitlist
          </button>
        </form>

        {/* Privacy Notice */}
        <p className="text-[12px] text-[#86868b] text-center mt-6 leading-relaxed">
          By joining the waitlist, you agree to receive updates about Hoberg Premium. We respect your privacy and will never share your information with third parties.
        </p>
      </div>
    </div>
  )
}
