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
}

export default function PaystackButton({
  amount,
  planTier,
  planName,
  label = 'Upgrade with Paystack',
  className = '',
}: PaystackButtonProps) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handlePaystackPayment = async () => {
    setLoading(true)

    // Check if user is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Prompt user to login/signup first before purchasing
      router.push(`/signup?redirect=/premium`)
      return
    }

    const email = user.email || 'customer@example.com'
    const reference = `hoberg_${planTier}_${user.id.slice(0, 8)}_${Date.now()}`

    // Load Paystack inline script dynamically if not present
    const loadPaystackScript = () => {
      return new Promise<boolean>((resolve) => {
        if (typeof window !== 'undefined' && (window as any).PaystackPop) {
          resolve(true)
          return
        }
        const script = document.createElement('script')
        script.src = 'https://js.paystack.co/v1/inline.js'
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
      })
    }

    const scriptLoaded = await loadPaystackScript()

    const paystackPublicKey =
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder_key'

    if (scriptLoaded && (window as any).PaystackPop && paystackPublicKey !== 'pk_test_placeholder_key') {
      const handler = (window as any).PaystackPop.setup({
        key: paystackPublicKey,
        email,
        amount: amount * 100, // Paystack amount is in Kobo (NGN * 100)
        currency: 'NGN',
        ref: reference,
        metadata: {
          custom_fields: [
            {
              display_name: 'Plan',
              variable_name: 'plan_tier',
              value: planName,
            },
            {
              display_name: 'User ID',
              variable_name: 'user_id',
              value: user.id,
            },
          ],
        },
        callback: async function (response: any) {
          // Verify with server & upgrade user account to Premium
          const res = await fetch('/api/paystack/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reference: response.reference || reference,
              planTier,
              amount,
            }),
          })
          if (res.ok) {
            setSuccess(true)
            router.push('/dashboard?upgraded=true')
            router.refresh()
          }
        },
        onClose: function () {
          setLoading(false)
        },
      })
      handler.openIframe()
    } else {
      // Demo / Test Instant Upgrade Simulator (if Paystack key is still in setup)
      const res = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          planTier,
          amount,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        router.push('/dashboard?upgraded=true')
        router.refresh()
      } else {
        alert('Could not complete upgrade. Please check database setup.')
        setLoading(false)
      }
    }
  }

  if (success) {
    return (
      <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-6 py-3 rounded-full border border-emerald-500/40 text-[14px] font-semibold">
        <CheckCircle className="w-4 h-4" />
        Upgraded to Premium!
      </div>
    )
  }

  return (
    <button
      onClick={handlePaystackPayment}
      disabled={loading}
      className={`inline-flex items-center justify-center font-semibold text-[15px] px-8 py-3.5 rounded-full transition-all shadow-sm disabled:opacity-60 ${className}`}
    >
      <Crown className="w-4 h-4 mr-2" />
      <span>{loading ? 'Processing...' : label}</span>
    </button>
  )
}
