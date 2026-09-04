'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Sparkles, CheckCircle } from '@/components/icons'
import { useToast } from '@/components/Toast'

interface PaystackPricingButtonProps {
  planId: string
  planName: string
  amountNgn: number
  kobo: number
  isLoggedIn: boolean
  isCurrentPlan?: boolean
  label?: string
  className?: string
}

export default function PaystackPricingButton({
  planId,
  planName,
  amountNgn,
  kobo,
  isLoggedIn,
  isCurrentPlan,
  label,
  className,
}: PaystackPricingButtonProps) {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      router.push(`/login?next=/pricing`)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          planName,
          amountNgn,
          kobo,
        }),
      })

      const data = await res.json()

      if (data.error) {
        toast.error('Payment Notice', data.error)
        setLoading(false)
        return
      }

      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        toast.error('Error', 'Could not open Paystack checkout. Please try again.')
        setLoading(false)
      }
    } catch {
      toast.error('Network Error', 'Please check your connection.')
      setLoading(false)
    }
  }

  if (isCurrentPlan) {
    return (
      <div className="w-full text-center py-3 bg-emerald-50 text-emerald-800 font-semibold text-[13px] rounded-full border border-emerald-200">
        ✓ Active Pro Plan
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className={
        className ||
        'w-full flex items-center justify-center gap-2 font-semibold text-[14px] bg-[#e02424] hover:bg-[#c81e1e] active:scale-[0.98] text-white py-3.5 rounded-full transition-all shadow-sm cursor-pointer disabled:opacity-60'
      }
    >
      <Crown className="w-4 h-4 text-white shrink-0" />
      <span>{loading ? 'Opening Paystack...' : label || `Get ${planName}`}</span>
    </button>
  )
}

