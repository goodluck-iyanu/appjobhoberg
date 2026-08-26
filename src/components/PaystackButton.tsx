'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Crown, Sparkles, CheckCircle, ArrowRight } from '@/components/icons'

interface PaystackButtonProps {
  amount: number
  planTier: 'founding_member' | 'standard'
  planName: string
  label?: string
  className?: string
  paymentLink?: string
}

export default function PaystackButton({
  amount,
  planTier,
  planName,
  label = 'Upgrade with Paystack',
  className = '',
  paymentLink,
}: PaystackButtonProps) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handlePaystackPayment = async () => {
    setErrorMsg(null)
    setLoading(true)

    // Check if user is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Direct user to signup/login first
      router.push(`/signup?redirect=/premium`)
      return
    }

    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          planTier,
          customPaymentLink: paymentLink,
        }),
      })

      const data = await res.json()

      if (data.error) {
        setErrorMsg(data.error)
        setLoading(false)
        return
      }

      if (data.authorization_url) {
        // Automatically verify upgrade in background if simulated
        if (data.is_simulated) {
          await fetch('/api/paystack/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reference: data.reference,
              planTier,
              amount,
            }),
          })
        }

        // Redirect to Paystack's official checkout page or callback
        window.location.href = data.authorization_url
      } else {
        setErrorMsg('Could not initialize payment. Please try again.')
        setLoading(false)
      }
    } catch {
      setErrorMsg('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full sm:w-auto">
      {errorMsg && (
        <p className="text-[12px] text-red-400 mb-2 font-medium">{errorMsg}</p>
      )}
      <button
        onClick={handlePaystackPayment}
        disabled={loading}
        className={`inline-flex items-center justify-center font-semibold text-[15px] px-8 py-3.5 rounded-full transition-all shadow-sm disabled:opacity-60 cursor-pointer ${className}`}
      >
        <Crown className="w-4 h-4 mr-2" />
        <span>{loading ? 'Opening Paystack...' : label}</span>
      </button>
    </div>
  )
}
