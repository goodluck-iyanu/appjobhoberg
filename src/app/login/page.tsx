'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, ShieldCheck, Sparkles } from '@/components/icons'

export default function LoginPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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
      setErrorMsg('Failed to initiate Google sign in. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24 bg-[#f5f5f7]">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-14 h-14 bg-[#1d1d1f] rounded-3xl mb-5 shadow-sm hover:scale-105 transition-transform"
          >
            <span className="font-bold text-2xl text-white">H</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
            Welcome to Hoberg Jobs
          </h1>
          <p className="text-[#86868b] text-[15px] mt-2 max-w-sm mx-auto">
            Sign in or create your account instantly with your Google account.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#d2d2d7]/70 rounded-3xl p-6 sm:p-10 shadow-sm">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-2xl flex items-start gap-2.5">
              <span className="shrink-0 text-base">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1-Click Google Sign in Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3.5 bg-white hover:bg-[#fafafc] active:bg-[#f5f5f7] text-[#1d1d1f] font-semibold text-[15px] px-6 py-4 rounded-2xl border-2 border-[#d2d2d7] hover:border-[#1d1d1f] transition-all shadow-sm disabled:opacity-60 cursor-pointer group"
          >
            {/* Google G Logo SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'Connecting Google...' : 'Continue with Google'}</span>
          </button>

          {/* Value Props */}
          <div className="mt-8 pt-6 border-t border-gray-100 space-y-3 text-[13px] text-[#86868b]">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#e02424] shrink-0" />
              <span>1-click secure access • No password required</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Automatic profile creation with full access</span>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[13px] text-[#86868b] hover:text-[#1d1d1f] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to explore remote jobs</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
