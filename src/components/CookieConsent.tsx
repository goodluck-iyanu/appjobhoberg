'use client'

import { useState, useEffect } from 'react'
import { CheckCircle } from '@/components/icons'

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('hoberg-cookie-consent')
    if (!consent) setShow(true)
  }, [])

  const accept = () => {
    localStorage.setItem('hoberg-cookie-consent', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-white p-4 rounded-2xl shadow-xl border border-[#d2d2d7] z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-[13px] text-[#1d1d1f] font-medium mb-1">We use cookies</p>
          <p className="text-[12px] text-[#86868b] leading-relaxed">
            Hoberg Jobs uses cookies to ensure you get the best experience, including securely keeping you logged in.
          </p>
        </div>
      </div>
      <button
        onClick={accept}
        className="mt-3 w-full bg-[#0066cc] text-white text-[12px] font-semibold py-2 rounded-xl hover:bg-[#0077ed] transition-colors"
      >
        Got it!
      </button>
    </div>
  )
}
