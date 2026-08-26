'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Menu, X, Crown } from '@/components/icons'

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
    return () => { document.body.style.overflow = '' }
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
        className="flex items-center justify-center w-10 h-10 rounded-full text-[#1d1d1f] hover:bg-black/5 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Dark backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={close}
          />

          {/* Menu panel — slides from right, full height */}
          <div className="absolute top-0 right-0 bottom-0 w-[85%] max-w-[320px] bg-white shadow-2xl flex flex-col animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <Link href="/" onClick={close} className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#1d1d1f] rounded-lg flex items-center justify-center">
                  <span className="font-bold text-sm text-white">H</span>
                </div>
                <span className="font-semibold text-[15px] text-[#1d1d1f]">Hoberg Jobs</span>
              </Link>
              <button
                onClick={close}
                className="flex items-center justify-center w-9 h-9 rounded-full text-[#86868b] hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 px-4 py-6">
              <div className="space-y-1">
                {[
                  { label: 'Find Jobs', href: '/jobs' },
                  { label: 'Categories', href: '/categories' },
                  { label: 'Premium', href: '/premium', isPremiumBadge: true },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl text-[17px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] active:bg-[#ebebed] transition-colors"
                  >
                    <span>{link.label}</span>
                    {link.isPremiumBadge && (
                      <Crown className="w-4 h-4 text-amber-500" />
                    )}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Auth buttons at the bottom */}
            <div className="px-4 py-6 border-t border-gray-100 space-y-3">
              {userEmail ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={close}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-[15px] font-medium text-white bg-[#0066cc] hover:bg-[#0077ed] transition-colors"
                  >
                    {isPremium && <Crown className="w-4 h-4 text-amber-300" />}
                    <span>Go to Dashboard</span>
                  </Link>
                  <form action="/auth/signout" method="POST">
                    <button
                      type="submit"
                      onClick={close}
                      className="flex items-center justify-center w-full py-2.5 rounded-full text-[14px] font-medium text-[#86868b] border border-gray-200 hover:bg-[#f5f5f7] transition-colors"
                    >
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={close}
                    className="flex items-center justify-center w-full py-3 rounded-full text-[15px] font-medium text-[#1d1d1f] border border-gray-200 hover:bg-[#f5f5f7] transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={close}
                    className="flex items-center justify-center w-full py-3 rounded-full text-[15px] font-medium text-white bg-[#0066cc] hover:bg-[#0077ed] transition-colors"
                  >
                    Sign up — it&apos;s free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.25s ease-out;
        }
      `}</style>
    </div>
  )
}
