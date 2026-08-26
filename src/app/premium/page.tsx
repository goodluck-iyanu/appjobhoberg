import Link from 'next/link'
import {
  Crown, Star, CheckCircle, Zap, Users, Briefcase,
  ShieldCheck, Heart, Sparkles, ArrowRight
} from '@/components/icons'

const features = [
  {
    icon: Briefcase,
    title: 'Curated Opportunities',
    description: 'Hand-picked remote jobs matched to your skills, experience level, and career goals.',
  },
  {
    icon: Sparkles,
    title: 'Application Tips',
    description: 'Personalised guidance on how to stand out and increase your chances of landing interviews.',
  },
  {
    icon: ShieldCheck,
    title: 'CV & Profile Review',
    description: 'Expert feedback on your CV and professional profile to make a lasting impression.',
  },
  {
    icon: Zap,
    title: 'Early Access',
    description: 'Be the first to see new listings before they go public. Speed matters in job hunting.',
  },
  {
    icon: Users,
    title: 'Community Access',
    description: 'Join a private community of ambitious professionals sharing leads, tips, and support.',
  },
  {
    icon: Star,
    title: 'Priority Support',
    description: 'Get faster responses and dedicated assistance from the Hoberg team when you need it.',
  },
]

const includedItems = [
  'Weekly curated job alerts',
  'Personalised application tips',
  'CV and cover letter guidance',
  'Early access to new listings',
  'Private community membership',
  'Priority support from our team',
]

export default function PremiumPage() {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f5f5f7] to-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg mb-8">
            <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1d1d1f] mb-4">
            Hoberg Premium
          </h1>
          <p className="text-lg sm:text-xl text-[#86868b] max-w-2xl mx-auto leading-relaxed">
            Elevate your job search with curated opportunities, expert guidance, and a community that has your back.
          </p>
        </div>
      </section>

      {/* What Premium Includes */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f] mb-4">
            What&apos;s included
          </h2>
          <p className="text-[#86868b] text-lg max-w-xl mx-auto">
            Everything you need to accelerate your career journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-white border border-[#d2d2d7]/60 rounded-2xl p-6 sm:p-8 hover:shadow-lg hover:border-[#d2d2d7] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[#f5f5f7] flex items-center justify-center mb-5 group-hover:bg-[#0066cc]/10 transition-colors">
                <feature.icon className="w-6 h-6 text-[#86868b] group-hover:text-[#0066cc] transition-colors" />
              </div>
              <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-2">
                {feature.title}
              </h3>
              <p className="text-[15px] text-[#86868b] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-[#f5f5f7]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f] mb-4">
              Simple pricing
            </h2>
            <p className="text-[#86868b] text-lg max-w-xl mx-auto">
              Join now as a founding member and lock in a special rate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Normal Plan */}
            <div className="bg-white border border-[#d2d2d7]/60 rounded-2xl p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#86868b] uppercase tracking-wider mb-3">
                  Standard
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#1d1d1f]">₦5,000</span>
                  <span className="text-[#86868b] text-sm">/month</span>
                </div>
                <p className="text-[13px] text-[#86868b] mt-2">Regular pricing after launch</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {includedItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#86868b] shrink-0 mt-0.5" />
                    <span className="text-[15px] text-[#1d1d1f]">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-[#d2d2d7]/60 pt-6">
                <span className="text-[13px] text-[#86868b]">Available at launch</span>
              </div>
            </div>

            {/* Founding Member Plan */}
            <div className="relative bg-[#1d1d1f] border border-[#1d1d1f] rounded-2xl p-8 flex flex-col text-white">
              <div className="absolute -top-3 left-8">
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-[#1d1d1f] text-xs font-bold px-3 py-1 rounded-full">
                  <Heart className="w-3 h-3" />
                  20% OFF
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                  Founding Member
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">₦4,000</span>
                  <span className="text-white/50 text-sm">/month</span>
                </div>
                <p className="text-[13px] text-white/50 mt-2">
                  <span className="line-through">₦5,000</span> — locked in forever
                </p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {includedItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-[15px] text-white/90">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/premium/waitlist"
                className="w-full inline-flex items-center justify-center gap-2 bg-white text-[#1d1d1f] font-semibold text-[15px] px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
              >
                Join the Waitlist
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="max-w-xl mx-auto mt-10 text-center">
            <p className="text-[13px] text-[#86868b] leading-relaxed">
              <ShieldCheck className="w-4 h-4 inline-block mr-1 -mt-0.5" />
              Premium does not guarantee employment. Hoberg Premium is a career support service designed to improve your job search experience.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f] mb-4">
          Ready to level up?
        </h2>
        <p className="text-[#86868b] text-lg max-w-md mx-auto mb-8">
          Secure your founding member spot today and get lifetime access at the discounted rate.
        </p>
        <Link
          href="/premium/waitlist"
          className="inline-flex items-center gap-2 bg-[#0066cc] text-white font-semibold text-[15px] px-8 py-3.5 rounded-full hover:bg-[#0077ed] transition-colors shadow-sm"
        >
          Join the Waitlist
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  )
}
