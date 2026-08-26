'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Globe, Mail, Lock, Eye, EyeOff, Check } from '@/components/icons'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: integrate auth
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1d1d1f] rounded-2xl mb-5">
            <span className="font-bold text-xl text-white">H</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
            Create your account
          </h1>
          <p className="text-[#86868b] text-[15px] mt-2">
            Start your journey with Hoberg
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#d2d2d7]/60 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Google Button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] font-medium text-[15px] px-4 py-2.5 rounded-xl border border-[#d2d2d7]/60 transition-colors"
          >
            <Globe className="w-5 h-5" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#d2d2d7]/60" />
            <span className="text-[13px] text-[#86868b]">or</span>
            <div className="flex-1 h-px bg-[#d2d2d7]/60" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7]/50 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b]/60 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/30 focus:border-[#0066cc] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7]/50 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b]/60 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/30 focus:border-[#0066cc] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7]/50 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b]/60 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/30 focus:border-[#0066cc] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-1">
              <button
                type="button"
                onClick={() => setAgreed(!agreed)}
                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                  agreed
                    ? 'bg-[#0066cc] border-[#0066cc]'
                    : 'border-[#d2d2d7] hover:border-[#86868b]'
                }`}
              >
                {agreed && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className="text-[13px] text-[#86868b] leading-relaxed">
                I agree to the{' '}
                <Link href="#" className="text-[#0066cc] hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-[#0066cc] hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={!agreed}
              className="w-full bg-[#0066cc] text-white font-semibold text-[15px] px-6 py-2.5 rounded-xl hover:bg-[#0077ed] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create account
            </button>
          </form>
        </div>

        {/* Bottom Link */}
        <p className="text-center text-[13px] text-[#86868b] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#0066cc] font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
