'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
  MapPin,
  FileText,
  CheckCircle,
  User,
  PlusCircle,
} from '@/components/icons'
import SignOutButton from '@/components/SignOutButton'

interface MobileMenuProps {
  user?: any
  isPremium?: boolean
  profileName?: string
}

export default function MobileMenu({ user, isPremium, profileName }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
    }
  }, [isOpen])

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

  const menuContent = isOpen ? (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col bg-white"
      style={{ height: '100dvh', minHeight: '-webkit-fill-available' }}
    >
      {/* Sheet Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
        <Link href="/" onClick={close} className="flex items-center gap-2">
          <span className="font-bold text-[18px] tracking-tight">
            <span className="text-[#e02424]">Hoberg</span>
            <span className="text-[#1d1d1f] ml-1">Jobs</span>
          </span>
          <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
            🇳🇬 NG
          </span>
        </Link>
        <button
          type="button"
          onClick={close}
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

          {/* User Profile Banner if logged in */}
          {user && (
            <div className="flex-shrink-0 px-5 py-3.5 bg-[#f5f5f7] border-b border-gray-200/60">
              <p className="text-[11px] text-[#86868b] font-medium uppercase tracking-wider">Signed in as</p>
              <p className="text-[14px] font-semibold text-[#1d1d1f] truncate mt-0.5">
                {profileName || user.email}
              </p>
              {isPremium ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1.5">
                  <Crown className="w-3 h-3" />
                  <span>Hoberg Pro Member</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#86868b] bg-white px-2 py-0.5 rounded-full mt-1.5 border border-gray-200">
                  <span>Free Seeker Plan</span>
                </span>
              )}
            </div>
          )}

          {/* Nav Links (Scrollable Middle) */}
          <div 
            className="px-4 py-4 space-y-1 bg-white"
            style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
          >
            {user ? (
              <>
                <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider px-3 py-2">
                  My Seeker Hub
                </p>
                  <Link
                    href="/"
                    onClick={close}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-[#1d1d1f] hover:bg-gray-50"
                  >
                    <Home className="w-4 h-4 text-[#e02424]" />
                    <span>My Dashboard</span>
                  </Link>
                  <Link
                    href="/app/tracker"
                    onClick={close}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-[#1d1d1f] hover:bg-gray-50"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Application Tracker</span>
                  </Link>
                  <Link
                    href="/app/cv"
                    onClick={close}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-[#1d1d1f] hover:bg-gray-50"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Master CV & Versions</span>
                  </Link>
                  <Link
                    href="/app/billing"
                    onClick={close}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-[#1d1d1f] hover:bg-gray-50"
                  >
                    <User className="w-4 h-4 text-gray-600" />
                    <span>Billing & Credits</span>
                  </Link>
                  <div className="my-2 border-t border-gray-100" />
                </>
              ) : null}

              <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider px-3 py-2">
                Explore Jobs
              </p>
              <Link
                href="/jobs"
                onClick={close}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-[#1d1d1f] hover:bg-gray-50"
              >
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span>All Live Jobs</span>
              </Link>
              <Link
                href="/jobs/lagos"
                onClick={close}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-[#1d1d1f] hover:bg-gray-50"
              >
                <MapPin className="w-4 h-4 text-[#e02424]" />
                <span>Lagos Opportunities</span>
              </Link>
              <Link
                href="/jobs/abuja"
                onClick={close}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-[#1d1d1f] hover:bg-gray-50"
              >
                <MapPin className="w-4 h-4 text-purple-600" />
                <span>Abuja Opportunities</span>
              </Link>
              <Link
                href="/jobs/remote-nigeria"
                onClick={close}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-[#1d1d1f] hover:bg-gray-50"
              >
                <span>🇳🇬</span>
                <span>Remote from Nigeria</span>
              </Link>
              <Link
                href="/jobs/remote-dollar"
                onClick={close}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-[#1d1d1f] hover:bg-gray-50"
              >
                <span>💵</span>
                <span>Dollar Remote Roles</span>
              </Link>
              <Link
                href="/jobs/graduate"
                onClick={close}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-[#1d1d1f] hover:bg-gray-50"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Graduate Jobs</span>
              </Link>
              <Link
                href="/jobs/nysc"
                onClick={close}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-[#1d1d1f] hover:bg-gray-50"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>NYSC Opportunities</span>
              </Link>
              <Link
                href="/categories"
                onClick={close}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-[#1d1d1f] hover:bg-gray-50"
              >
                <ArrowRight className="w-4 h-4 text-gray-500" />
                <span>All Categories</span>
              </Link>

              <div className="my-2 border-t border-gray-100" />

              <Link
                href="/pricing"
                onClick={close}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-[#1d1d1f] hover:bg-gray-50"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Free vs Pro Pricing</span>
              </Link>

              <Link
                href="/employers/post"
                onClick={close}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-[#e02424] hover:bg-red-50/50"
              >
                <PlusCircle className="w-4 h-4 text-[#e02424]" />
                <span>Post a Job (Employers)</span>
              </Link>
            </div>

            {/* Bottom Auth Section */}
          <div 
            className="flex-shrink-0 p-4 border-t border-gray-100 bg-[#f5f5f7]"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
          >
            {user ? (
                <div className="flex items-center justify-between">
                  <Link
                    href="/app/billing"
                    onClick={close}
                    className="text-[12px] font-medium text-[#86868b] hover:text-[#1d1d1f]"
                  >
                    Billing & Credits
                  </Link>
                  <SignOutButton />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleQuickGoogleSignIn}
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-2.5 bg-white text-[#1d1d1f] font-semibold text-[14px] px-4 py-3 rounded-xl border border-[#d2d2d7] shadow-sm hover:bg-gray-50 disabled:opacity-60"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span>{authLoading ? 'Signing in...' : 'Sign in with Google'}</span>
                </button>
              )}
          </div>
        </div>
      ) : null

  return (
    <div className="md:hidden">
      {/* Hamburger toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-10 h-10 rounded-xl text-[#1d1d1f] hover:bg-black/5 active:bg-black/10 transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="w-6 h-6 text-[#1d1d1f]" />
      </button>

      {/* Render menu through a portal so it breaks out of any backdrop-filters or stacking contexts */}
      {mounted && createPortal(menuContent, document.body)}
    </div>
  )
}
