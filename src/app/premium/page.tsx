import Link from 'next/link'
import PaystackButton from '@/components/PaystackButton'
import {
  Crown,
  Star,
  CheckCircle,
  Zap,
  Users,
  Briefcase,
  ShieldCheck,
  Heart,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from '@/components/icons'

const features = [
  {
    icon: Briefcase,
    title: 'Curated Opportunities',
    description:
      'Hand-picked remote opportunities vetted for legitimacy, competitive pay, and direct employer contact.',
  },
  {
    icon: Zap,
    title: 'Priority Application Support',
    description:
      'Tailored application tips, resume tailoring suggestions, and direct interview preparation guidance.',
  },
  {
    icon: Star,
    title: 'Early Access Feeds',
    description:
      'Get notified of high-paying remote roles 24 to 48 hours before they are published publicly.',
  },
  {
    icon: Users,
    title: 'Recruiter Direct Network',
    description:
      'Direct visibility to global remote companies hiring talent across Nigeria, Africa, and Worldwide.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Employer Guarantee',
    description:
      'Zero scam listings, zero middlemen. Every single opportunity is verified by Hoberg Digital Agency.',
  },
  {
    icon: Heart,
    title: 'Dedicated Career Coaching',
    description:
      'Monthly group Q&A calls with career mentors to optimize your remote job search strategy.',
  },
]

export default function PremiumPage() {
  return (
    <div className="flex-1 bg-white">
      {/* ─── Hero ─── */}
      <section className="pt-16 pb-14 sm:pt-24 sm:pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f] mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Jobs
          </Link>

          <div className="inline-flex items-center gap-2 bg-[#f5f5f7] border border-[#d2d2d7] rounded-full px-4 py-1.5 mb-6 shadow-sm">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-[12px] sm:text-[13px] font-semibold text-[#1d1d1f] tracking-wide uppercase">
              Hoberg Premium
            </span>
          </div>

          <h1 className="text-[36px] sm:text-[56px] md:text-[68px] font-semibold tracking-tight text-[#1d1d1f] leading-[1.08] mb-6">
            Accelerate your remote
            <br className="hidden sm:block" />
            <span className="text-[#0066cc]"> career trajectory.</span>
          </h1>

          <p className="text-[16px] sm:text-[19px] md:text-[21px] text-[#86868b] max-w-2xl mx-auto font-normal mb-10 leading-relaxed px-2">
            Gain an unfair advantage with curated opportunities, recruiter access, and tailored application support.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <PaystackButton
              amount={4000}
              planTier="founding_member"
              planName="Founding Member (20% OFF)"
              label="Upgrade Now with Paystack (₦4,000 / mo)"
              className="bg-[#0066cc] hover:bg-[#0077ed] text-white w-full sm:w-auto"
            />
            <Link
              href="/premium/waitlist"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] font-semibold px-6 py-3.5 rounded-full border border-[#d2d2d7] transition-colors text-[15px]"
            >
              Join Free Waitlist
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="bg-[#f5f5f7] py-16 sm:py-24 border-t border-b border-black/[0.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-[24px] sm:text-[34px] font-semibold text-[#1d1d1f] tracking-tight mb-3">
              Everything in Premium
            </h2>
            <p className="text-[15px] sm:text-[17px] text-[#86868b]">
              Tools and curation designed to help you land high-paying global remote roles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white border border-[#d2d2d7]/70 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 bg-blue-50 text-[#0066cc] rounded-xl flex items-center justify-center mb-5 border border-blue-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-[18px] font-semibold text-[#1d1d1f] mb-2">
                    {title}
                  </h3>
                  <p className="text-[14px] text-[#86868b] leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing Card with Paystack ─── */}
      <section className="py-16 sm:py-24 px-4 max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h2 className="text-[28px] sm:text-[38px] font-semibold text-[#1d1d1f] tracking-tight mb-3">
            Simple, Transparent Pricing
          </h2>
          <p className="text-[15px] sm:text-[17px] text-[#86868b]">
            Secure checkout in Nigerian Naira (NGN) via Paystack. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
          {/* Free Tier */}
          <div className="bg-[#f5f5f7] border border-[#d2d2d7] rounded-3xl p-8 flex flex-col justify-between">
            <div>
              <span className="text-[13px] font-bold text-[#86868b] uppercase tracking-wider">
                Basic Access
              </span>
              <h3 className="text-[24px] font-bold text-[#1d1d1f] mt-1 mb-3">
                Free Forever
              </h3>
              <div className="text-[32px] font-bold text-[#1d1d1f] mb-4">
                ₦0 <span className="text-[14px] font-normal text-[#86868b]">/ month</span>
              </div>
              <ul className="space-y-3 text-[14px] text-[#1d1d1f] mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  Browse all public remote jobs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  Search &amp; category filters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  Save jobs &amp; track applications
                </li>
              </ul>
            </div>
            <Link
              href="/signup"
              className="w-full text-center bg-white hover:bg-gray-50 text-[#1d1d1f] font-semibold py-3 rounded-full border border-[#d2d2d7] transition-colors text-[15px]"
            >
              Get Started Free
            </Link>
          </div>

          {/* Premium Tier with Paystack */}
          <div className="bg-gradient-to-br from-[#1d1d1f] to-[#2b2b2f] text-white rounded-3xl p-8 flex flex-col justify-between relative shadow-xl border border-white/10">
            <div className="absolute top-6 right-6">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                20% OFF
              </span>
            </div>
            <div>
              <span className="text-[13px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Crown className="w-4 h-4" /> Founding Member
              </span>
              <h3 className="text-[24px] font-bold text-white mt-1 mb-3">
                Hoberg Premium
              </h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-[36px] font-bold text-white">₦4,000</span>
                <span className="text-[14px] text-white/60">/ month</span>
                <span className="text-[15px] text-white/40 line-through ml-2">₦5,000</span>
              </div>
              <ul className="space-y-3 text-[14px] text-white/90 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  Curated Premium opportunity feeds
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  Tailored CV &amp; application tips
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  Early access to high-paying global roles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  Gold PRO Badge on Profile &amp; Dashboard
                </li>
              </ul>
            </div>

            <PaystackButton
              amount={4000}
              planTier="founding_member"
              planName="Founding Member"
              label="Pay ₦4,000 with Paystack"
              className="bg-[#0066cc] hover:bg-[#0077ed] text-white w-full shadow-lg"
            />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 text-[13px] text-[#86868b] max-w-xl mx-auto leading-relaxed">
          <p>
            <strong>Note:</strong> Hoberg Premium provides curated job access and application guidance. It does not guarantee employment.
          </p>
        </div>
      </section>
    </div>
  )
}
