'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Globe, Mail, Lock, Eye, EyeOff } from '@/components/icons'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: integrate auth
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
            Welcome back
          </h1>
          <p className="text-[#86868b] text-[15px] mt-2">
            Sign in to your Hoberg account
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                href="#"
                className="text-[13px] text-[#0066cc] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-[#0066cc] text-white font-semibold text-[15px] px-6 py-2.5 rounded-xl hover:bg-[#0077ed] transition-colors shadow-sm"
            >
              Sign in
            </button>
          </form>
        </div>

        {/* Bottom Link */}
        <p className="text-center text-[13px] text-[#86868b] mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#0066cc] font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
