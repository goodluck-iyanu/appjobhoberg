'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import {
  Menu,
  X,
  Crown,
  Briefcase,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe,
} from '@/components/icons'

interface MobileMenuProps {
  userEmail?: string | null
  isPremium?: boolean
}

export default function MobileMenu({ userEmail, isPremium }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const supabase = createClient()

  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, close])

  const handleQuickGoogleSignIn = async () => {
    setAuthLoading(true)
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
    } catch {
      setAuthLoading(false)
    }
  }

  return (
    <div className="md:hidden">
      {/* Hamburger toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-10 h-10 rounded-xl text-[#1d1d1f] hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer"
        aria-label="Open navigation menu"
      >
        <Menu className="w-6 h-6 text-[#1d1d1f]" />
      </button>

      {/* Full-screen Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Dimmed backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={close}
            aria-hidden="true"
          />

          {/* Menu Sheet (Solid Opaque White Background) */}
          <div
            className="relative z-10 w-full max-w-[320px] sm:max-w-[360px] h-full flex flex-col shadow-2xl border-l border-gray-200 bg-white"
            style={{ backgroundColor: '#ffffff' }}
          >
            {/* Top Sheet Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white"
              style={{ backgroundColor: '#ffffff' }}
            >
              <Link href="/" onClick={close} className="flex items-center">
                <div>
                  <span className="font-bold text-[18px] tracking-tight block leading-tight">
                    <span className="text-[#e02424]">Hoberg</span>
                    <span className="text-[#1d1d1f] ml-1">Jobs</span>
                  </span>
                  <span className="text-[11px] text-[#86868b] block">Remote Careers</span>
                </div>
              </Link>

              <button
                type="button"
                onClick={close}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-[#1d1d1f] transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User status card (if signed in) */}
            {userEmail && (
              <div className="mx-4 mt-4 p-3.5 bg-[#f5f5f7] border border-gray-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center text-xs font-bold">
                      {userEmail[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 max-w-[150px]">
                      <p className="text-[13px] font-semibold text-[#1d1d1f] truncate">
                        {userEmail}
                      </p>
                      <p className="text-[11px] text-[#86868b]">
                        {isPremium ? 'PRO Member' : 'Free Account'}
                      </p>
                    </div>
                  </div>
                  {isPremium && (
                    <span className="bg-amber-400/20 text-amber-700 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      PRO
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-5 overflow-y-auto space-y-2">
              <Link
                href="/jobs"
                onClick={close}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f5f5f7] hover:bg-[#ebebed] text-[#1d1d1f] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-50 text-[#e02424] flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-[15px]">Find Remote Jobs</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#86868b]" />
              </Link>

              <Link
                href="/categories"
                onClick={close}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f5f5f7] hover:bg-[#ebebed] text-[#1d1d1f] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-[15px]">Categories</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#86868b]" />
              </Link>

              <Link
                href="/premium"
                onClick={close}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 text-[#1d1d1f] hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[15px] block text-[#1d1d1f]">
                      Hoberg Premium
                    </span>
                    <span className="text-[11px] text-amber-800 font-medium block">
                      Founding Member (20% OFF)
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-600" />
              </Link>
            </nav>

            {/* Bottom Action Buttons */}
            <div
              className="p-4 border-t border-gray-100 space-y-2.5 bg-white"
              style={{ backgroundColor: '#ffffff' }}
            >
              {userEmail ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={close}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-[15px] font-semibold text-white bg-[#e02424] hover:bg-[#c81e1e] transition-colors shadow-sm cursor-pointer"
                  >
                    {isPremium && <Crown className="w-4 h-4 text-amber-300" />}
                    <span>Open Dashboard</span>
                  </Link>

                  <form action="/auth/signout" method="POST">
                    <button
                      type="submit"
                      onClick={close}
                      className="flex items-center justify-center w-full py-2.5 rounded-full text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  {/* Quick Google 1-Click Button */}
                  <button
                    type="button"
                    onClick={handleQuickGoogleSignIn}
                    disabled={authLoading}
                    className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-full text-[15px] font-bold text-white bg-[#e02424] hover:bg-[#c81e1e] active:bg-[#b91c1c] transition-colors shadow-md cursor-pointer"
                  >
                    {/* Google G Icon */}
                    <svg className="w-4 h-4 shrink-0 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
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
                    <span>{authLoading ? 'Connecting...' : 'Sign up with Google'}</span>
                  </button>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href="/signup"
                      onClick={close}
                      className="flex-1 text-center py-2.5 rounded-full text-[13px] font-semibold text-[#1d1d1f] border border-gray-300 hover:bg-[#f5f5f7] transition-colors"
                    >
                      Sign Up
                    </Link>

                    <Link
                      href="/login"
                      onClick={close}
                      className="flex-1 text-center py-2.5 rounded-full text-[13px] font-semibold text-[#1d1d1f] border border-gray-300 hover:bg-[#f5f5f7] transition-colors"
                    >
                      Log in
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
