'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Menu,
  X,
  Crown,
  Briefcase,
  Sparkles,
  ArrowRight,
} from '@/components/icons'

interface MobileMenuProps {
  userEmail?: string | null
  isPremium?: boolean
}

export default function MobileMenu({ userEmail, isPremium }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

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

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-10 h-10 rounded-xl text-[#1d1d1f] hover:bg-black/5 active:bg-black/10 transition-colors"
        aria-label="Open menu"
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

          {/* Menu Sheet (Solid 100% Opaque White Background) */}
          <div
            className="relative z-10 w-full max-w-[320px] sm:max-w-[360px] h-full flex flex-col shadow-2xl border-l border-gray-200"
            style={{ backgroundColor: '#ffffff' }}
          >
            {/* Top Sheet Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b border-gray-100"
              style={{ backgroundColor: '#ffffff' }}
            >
              <Link href="/" onClick={close} className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#1d1d1f] rounded-xl flex items-center justify-center shadow-sm">
                  <span className="font-bold text-sm text-white">H</span>
                </div>
                <div>
                  <span className="font-bold text-[16px] text-[#1d1d1f] block leading-tight">
                    Hoberg Jobs
                  </span>
                  <span className="text-[11px] text-[#86868b] block">Remote Careers</span>
                </div>
              </Link>

              <button
                onClick={close}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-[#1d1d1f] transition-colors"
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
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0066cc] flex items-center justify-center">
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
              className="p-4 border-t border-gray-100 space-y-2.5"
              style={{ backgroundColor: '#ffffff' }}
            >
              {userEmail ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={close}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-[15px] font-semibold text-white bg-[#0066cc] hover:bg-[#0077ed] transition-colors shadow-sm"
                  >
                    {isPremium && <Crown className="w-4 h-4 text-amber-300" />}
                    <span>Open Dashboard</span>
                  </Link>

                  <form action="/auth/signout" method="POST">
                    <button
                      type="submit"
                      onClick={close}
                      className="flex items-center justify-center w-full py-2.5 rounded-full text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
                    >
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    onClick={close}
                    className="flex items-center justify-center w-full py-3.5 rounded-full text-[15px] font-semibold text-white bg-[#0066cc] hover:bg-[#0077ed] transition-colors shadow-sm"
                  >
                    Sign up — Free Account
                  </Link>

                  <Link
                    href="/login"
                    onClick={close}
                    className="flex items-center justify-center w-full py-3 rounded-full text-[14px] font-medium text-[#1d1d1f] border border-gray-200 hover:bg-[#f5f5f7] transition-colors"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
