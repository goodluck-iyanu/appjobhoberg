'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { LogOut, X } from 'lucide-react'

interface SignOutButtonProps {
  className?: string
  variant?: 'nav' | 'mobile' | 'drawer'
  onSignedOut?: () => void
}

export default function SignOutButton({
  className = '',
  variant = 'nav',
  onSignedOut,
}: SignOutButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleConfirmSignOut = async () => {
    setLoading(true)
    try {
      // 1. Get current user info for audit logging
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // 2. Call audit logging API
        try {
          await fetch('/api/auth/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              userEmail: user.email,
              userName:
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split('@')[0],
              eventType: 'logout',
            }),
          })
        } catch (e) {
          console.error('Failed to log logout event:', e)
        }
      }

      // 3. Client & Server sign out
      await fetch('/auth/signout', { method: 'POST' }).catch(() => {})
      await supabase.auth.signOut()

      if (onSignedOut) onSignedOut()

      // 4. Redirect to login page
      window.location.href = '/login?signed_out=true'
    } catch {
      window.location.href = '/login'
    }
  }

  return (
    <>
      {/* Trigger Button */}
      {variant === 'mobile' || variant === 'drawer' ? (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className={
            className ||
            'flex items-center justify-center w-full py-2.5 rounded-full text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors cursor-pointer'
          }
        >
          Sign Out
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className={
            className ||
            'text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer'
          }
        >
          Log out
        </button>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => !loading && setShowModal(false)}
            aria-hidden="true"
          />

          <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 text-center">
            <button
              type="button"
              onClick={() => !loading && setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#e02424] flex items-center justify-center mx-auto mb-3.5">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="text-[18px] font-bold text-[#1d1d1f] mb-1.5">
              Sign Out of Hoberg Jobs?
            </h3>

            <p className="text-[13px] text-[#86868b] mb-6 leading-relaxed">
              Are you sure you want to log out? You will need to sign in again with Google to access your dashboard and applications.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleConfirmSignOut}
                disabled={loading}
                className="w-full py-3 rounded-full text-[14px] font-bold text-white bg-[#e02424] hover:bg-[#c81e1e] active:bg-[#b91c1c] transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {loading ? 'Signing out...' : 'Yes, Sign Out'}
              </button>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="w-full py-2.5 rounded-full text-[13px] font-semibold text-[#1d1d1f] bg-[#f5f5f7] hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel / Stay Signed In
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
