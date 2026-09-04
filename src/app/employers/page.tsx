import Link from 'next/link'
import { Briefcase, CheckCircle, Crown, ArrowRight } from '@/components/icons'

export default function EmployersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="px-4 py-20 sm:py-32 bg-[#f5f5f7] border-b border-[#d2d2d7]/50 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium text-[#1d1d1f] mb-4">
            <Briefcase className="w-4 h-4 text-[#0066cc]" />
            Hoberg for Employers
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#1d1d1f] leading-tight">
            Hire the best Nigerian talent. <br className="hidden sm:block" />
            Zero friction.
          </h1>
          <p className="text-lg sm:text-xl text-[#86868b] leading-relaxed max-w-2xl mx-auto">
            Post your job in minutes. We verify it and distribute it to thousands of pre-vetted professionals ready to work remotely or on-site.
          </p>
          <div className="pt-8">
            <Link
              href="/employers/post"
              className="inline-flex items-center justify-center gap-2 bg-[#0066cc] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#0077ed] transition-colors shadow-sm"
            >
              Post a Job for ₦10,000
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-20 sm:py-32 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#1d1d1f] mb-4">Why hire on Hoberg?</h2>
          <p className="text-[#86868b]">We filter the noise so you only see the signal.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#f5f5f7]/50 rounded-3xl p-8 border border-[#d2d2d7]/30">
            <div className="w-12 h-12 bg-blue-100 text-[#0066cc] rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3">Verified Audience</h3>
            <p className="text-[#86868b] leading-relaxed">
              Every job is shown to actively searching professionals. We prioritize quality candidates with high match scores.
            </p>
          </div>

          <div className="bg-[#f5f5f7]/50 rounded-3xl p-8 border border-[#d2d2d7]/30">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
              <Crown className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3">Premium Placement</h3>
            <p className="text-[#86868b] leading-relaxed">
              Your job will be pinned to the top of relevant categories and distributed via email alerts to top matches.
            </p>
          </div>

          <div className="bg-[#f5f5f7]/50 rounded-3xl p-8 border border-[#d2d2d7]/30">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3">Simple Process</h3>
            <p className="text-[#86868b] leading-relaxed">
              No account required. Just fill the form, complete payment, and your job goes live after a quick manual review.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

