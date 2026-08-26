'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Globe, Mail, Lock, Eye, EyeOff } from '@/components/icons'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMsg(error.message)
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setErrorMsg(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setErrorMsg(error.message)
        setLoading(false)
      }
    } catch {
      setErrorMsg('Failed to initiate Google sign in.')
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20 bg-[#f5f5f7]">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-12 h-12 bg-[#1d1d1f] rounded-2xl mb-4 shadow-sm hover:scale-105 transition-transform">
            <span className="font-bold text-xl text-white">H</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
            Welcome back
          </h1>
          <p className="text-[#86868b] text-[15px] mt-1.5">
            Sign in to your Hoberg Jobs account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#d2d2d7]/70 rounded-3xl p-6 sm:p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl flex items-start gap-2">
              <span className="shrink-0 text-base">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] font-medium text-[15px] px-4 py-3 rounded-2xl border border-[#d2d2d7]/60 transition-colors disabled:opacity-60 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-[#e02424]" />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#d2d2d7]/60" />
            <span className="text-[12px] uppercase font-semibold text-[#86868b] tracking-wider">or email</span>
            <div className="flex-1 h-px bg-[#d2d2d7]/60" />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl pl-10 pr-3.5 py-2.5 text-[15px] text-[#1d1d1f] placeholder-[#86868b] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-[13px] font-semibold text-[#1d1d1f]">
                  Password
                </label>
                <Link
                  href="/login"
                  onClick={() => alert('Password reset links will be sent to your verified email address.')}
                  className="text-[12px] font-medium text-[#e02424] hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-xl pl-10 pr-10 py-2.5 text-[15px] text-[#1d1d1f] placeholder-[#86868b] outline-none focus:bg-white focus:ring-2 focus:ring-[#e02424]/20 focus:border-[#e02424] transition-all"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold text-[15px] py-3 rounded-full transition-colors shadow-sm disabled:opacity-60 mt-2 cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6 pt-5 border-t border-[#d2d2d7]/40">
            <p className="text-[13px] text-[#86868b]">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#e02424] font-semibold hover:underline">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
