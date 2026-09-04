'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { PRICING_PLANS, ONE_OFF_CREDITS } from '@/types'
import PaystackPricingButton from '@/components/PaystackPricingButton'
import {
  Crown,
  Sparkles,
  CheckCircle,
  FileText,
  Clock,
  ArrowLeft,
  DollarSign,
} from '@/components/icons'

export default function BillingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [credits, setCredits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login?next=/app/billing'
        return
      }
      setUser(user)

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(prof)

      const { data: ledger } = await supabase
        .from('credit_ledger')
        .select('*')
        .eq('user_id', user.id)

      setCredits(ledger || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="flex-1 bg-[#fbfbfd] flex items-center justify-center p-8">Loading...</div>
  }

  const isPro = profile?.is_premium
  const planLabel = isPro
    ? PRICING_PLANS.find((p) => p.id === profile?.premium_tier)?.name || 'Hoberg Pro'
    : 'Free Seeker Plan'

  // Calculate wallet credits
  const tailorCredits = credits.filter((c) => c.kind === 'tailor_cv').reduce((acc, c) => acc + c.delta, 0)
  const rewriteCredits = credits.filter((c) => c.kind === 'rewrite_cv').reduce((acc, c) => acc + c.delta, 0)

  // Calculate quota credits
  const tailorQuota = credits.filter((c) => c.kind === 'tailor_quota').reduce((acc, c) => acc + c.delta, 0)
  const rewriteQuota = credits.filter((c) => c.kind === 'rewrite_quota').reduce((acc, c) => acc + c.delta, 0)
  const coverLetterQuota = credits.filter((c) => c.kind === 'cover_letter_quota').reduce((acc, c) => acc + c.delta, 0)

  return (
    <div className="flex-1 bg-[#f5f5f7] py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/app"
            className="inline-flex items-center gap-1 text-[12px] text-[#86868b] hover:text-[#1d1d1f] mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
            Billing, Plans &amp; AI Credits
          </h1>
          <p className="text-[13px] text-[#86868b] mt-0.5">
            Manage your Hoberg Pro membership and individual AI generation credits.
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Current Membership</p>
              <h2 className="text-2xl font-bold text-[#1d1d1f] flex items-center gap-2 mt-0.5">
                {isPro ? (
                  <>
                    <Crown className="w-6 h-6 text-amber-500" />
                    <span>Hoberg Pro ({profile?.premium_tier === 'pro_yearly' ? 'Annual' : 'Monthly'})</span>
                  </>
                ) : (
                  <span>Free Seeker Plan</span>
                )}
              </h2>
              <p className="text-[13px] text-[#86868b] mt-1">
                {isPro
                  ? `Active until ${new Date(profile?.premium_until || Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}. Includes 8 tailored CVs/mo.`
                  : 'Unlimited free applications forever. Upgrade to Pro for AI CV tailoring and instant alerts.'}
              </p>
            </div>

            {isPro ? (
              <div className="shrink-0 text-center flex flex-col items-center">
                <span className="text-[12px] text-emerald-700 font-semibold mb-2">✓ Active Subscription</span>
                <div
                  className="bg-white border border-gray-200 text-gray-600 font-medium text-[12px] px-4 py-2 rounded-xl transition-colors text-center"
                >
                  Cancel anytime
                </div>
              </div>
            ) : (
              <Link
                href="/pricing"
                className="bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold text-[13px] px-6 py-3 rounded-full shadow-xs shrink-0 text-center"
              >
                Upgrade to Pro (₦2,500/mo) →
              </Link>
            )}
          </div>

          {/* Credits Balance Strip */}
          <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#f5f5f7]">
              <p className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider">Tailored CV Credits</p>
              <p className="text-xl font-bold text-[#1d1d1f] mt-0.5">
                {isPro ? `${Math.max(0, tailorQuota)} / 8 (Pro)` : `${Math.max(0, tailorCredits)} Credits`}
              </p>
              {isPro && Math.max(0, tailorCredits) > 0 && (
                <p className="text-[11px] text-amber-700 mt-1 font-medium">
                  + {tailorCredits} in wallet
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f5f5f7]">
              <p className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider">AI Rewrites</p>
              <p className="text-xl font-bold text-[#1d1d1f] mt-0.5">
                {isPro ? `${Math.max(0, rewriteQuota)} / 2 (Pro)` : `${Math.max(0, rewriteCredits)} Credits`}
              </p>
              {isPro && Math.max(0, rewriteCredits) > 0 && (
                <p className="text-[11px] text-amber-700 mt-1 font-medium">
                  + {rewriteCredits} in wallet
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f5f5f7] col-span-2 sm:col-span-1">
              <p className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider">Job Applications</p>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">Unlimited (Free)</p>
            </div>
          </div>
        </div>

        {/* Buy Single Credits Strip */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-xs">
          <h3 className="text-lg font-bold text-[#1d1d1f] mb-1">Buy One-Off Credits</h3>
          <p className="text-[13px] text-[#86868b] mb-6">
            Pay once without subscribing. Credits never expire.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ONE_OFF_CREDITS.slice(0, 3).map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-[#f5f5f7] flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-[14px] text-[#1d1d1f]">{item.name}</h4>
                  <p className="text-lg font-extrabold text-[#e02424] mt-1">₦{item.price_ngn.toLocaleString()}</p>
                  <p className="text-[12px] text-[#86868b] mt-1">{item.description}</p>
                </div>
                <div className="mt-4 pt-2">
                  <PaystackPricingButton
                    planId={item.id}
                    planName={item.name}
                    amountNgn={item.price_ngn}
                    kobo={item.kobo}
                    isLoggedIn={true}
                    label="Buy"
                    className="w-full text-[12px] py-2 bg-white border border-gray-300 hover:bg-gray-100 text-[#1d1d1f]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

