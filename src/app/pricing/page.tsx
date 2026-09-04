import Link from 'next/link'
import { PRICING_PLANS, ONE_OFF_CREDITS } from '@/types'
import PaystackPricingButton from '@/components/PaystackPricingButton'
import { createClient } from '@/utils/supabase/server'
import {
  ShieldCheck,
  CheckCircle,
  Sparkles,
  Crown,
  FileText,
  Zap,
  ArrowRight,
} from '@/components/icons'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PricingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isPremium = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, premium_tier')
      .eq('id', user.id)
      .maybeSingle()
    isPremium = Boolean(profile?.is_premium)
  }

  return (
    <div className="flex-1 bg-[#f5f5f7] py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-[#d2d2d7] rounded-full px-4 py-1 mb-4 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[12px] font-semibold text-[#1d1d1f]">
              Apply is 100% Free. We only charge for optional AI generation.
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f]">
            Simple, honest pricing.
          </h1>
          <p className="text-[15px] sm:text-[17px] text-[#86868b] mt-3 leading-relaxed">
            Finding and applying to jobs in Nigeria will always be free. Upgrade to Pro or buy single credits only when you want AI to tailor or rewrite your CV.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PRICING_PLANS.slice(0, 3).map((plan) => {
            const isPro = plan.id !== 'free'

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-6 sm:p-8 border flex flex-col justify-between transition-all relative ${
                  plan.popular
                    ? 'border-[#e02424] shadow-md ring-2 ring-[#e02424]/10'
                    : 'border-black/[0.06] shadow-xs'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e02424] text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="font-bold text-[18px] text-[#1d1d1f]">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#1d1d1f]">
                      {plan.price_ngn === 0 ? '₦0' : `₦${plan.price_ngn.toLocaleString()}`}
                    </span>
                    <span className="text-[13px] text-[#86868b]">/ {plan.period}</span>
                  </div>

                  <div className="my-6 border-t border-gray-100" />

                  <ul className="space-y-3 text-[13px] text-[#1d1d1f]">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-100">
                  {plan.id === 'free' ? (
                    <Link
                      href={user ? '/app' : '/login'}
                      className="w-full flex items-center justify-center font-semibold text-[14px] bg-[#f5f5f7] hover:bg-gray-200 text-[#1d1d1f] py-3.5 rounded-full transition-all"
                    >
                      {user ? 'Your Current Plan' : 'Get Started Free'}
                    </Link>
                  ) : (
                    <PaystackPricingButton
                      planId={plan.id}
                      planName={plan.name}
                      amountNgn={plan.price_ngn}
                      kobo={plan.kobo}
                      isLoggedIn={!!user}
                      isCurrentPlan={isPremium && plan.id === 'pro_monthly'}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* ─── One-Off Credits Section (No Monthly Commitment) ─── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-black/[0.06] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[12px] font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>One-Off Credits (No Subscription Required)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1d1d1f]">
                Pay only for what you use.
              </h2>
              <p className="text-[13px] text-[#86868b] mt-1">
                Credits never expire. Purchase single AI generations without subscribing to Pro.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ONE_OFF_CREDITS.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-[15px] text-[#1d1d1f]">{item.name}</h3>
                    <span className="font-extrabold text-[15px] text-[#e02424]">
                      ₦{item.price_ngn.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#86868b] mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200/60">
                  <PaystackPricingButton
                    planId={item.id as any}
                    planName={item.name}
                    amountNgn={item.price_ngn}
                    kobo={item.kobo}
                    isLoggedIn={!!user}
                    label="Buy Credit"
                    className="w-full text-[12px] py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-[#1d1d1f]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Trust FAQ ─── */}
        <div className="mt-12 text-center max-w-2xl mx-auto">
          <p className="text-[13px] text-[#86868b] leading-relaxed">
            All payments are processed securely in Nigerian Naira (NGN) via Paystack. Local cards, bank transfers, and USSD supported.
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-[12px] text-[#86868b]">
            <span>✓ Instant activation</span>
            <span>•</span>
            <span>✓ Cancel subscription anytime</span>
            <span>•</span>
            <span>✓ Zero hidden fees</span>
          </div>
        </div>
      </div>
    </div>
  )
}

