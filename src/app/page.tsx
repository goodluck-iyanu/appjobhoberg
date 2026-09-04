import Link from 'next/link'
import { fetchLiveJobs } from '@/utils/jobs'
import { createClient } from '@/utils/supabase/server'
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle,
  FileText,
  Clock,
  ExternalLink,
  Crown,
  DollarSign,
  UserCheck,
} from '@/components/icons'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userProfile = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
    userProfile = profile
  }

  // Fetch top 12 verified jobs with truthful match calculation
  const jobs = await fetchLiveJobs({
    limit: 12,
    userProfile,
  })

  const quickFilterPills = [
    { label: '🇳🇬 All Nigeria', href: '/jobs' },
    { label: '📍 Lagos', href: '/jobs/lagos' },
    { label: '🏛️ Abuja', href: '/jobs/abuja' },
    { label: '🌐 Remote (Nigeria)', href: '/jobs/remote-nigeria' },
    { label: '💵 Dollar Remote', href: '/jobs/remote-dollar' },
    { label: '🎓 Graduate / NYSC', href: '/jobs/graduate' },
    { label: '💻 Software Dev', href: '/jobs/software-developer-nigeria' },
    { label: '🎧 Customer Support', href: '/jobs/customer-service' },
  ]

  return (
    <div className="flex-1 bg-white">
      {/* ─── Hero Section ─── */}
      <section className="pt-12 pb-10 sm:pt-20 sm:pb-16 px-4 text-center bg-gradient-to-b from-white via-[#fafafc] to-[#f5f5f7]">
        <div className="max-w-4xl mx-auto">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#d2d2d7] rounded-full px-4 py-1.5 mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[12px] sm:text-[13px] font-semibold text-[#1d1d1f] tracking-wide">
              🇳🇬 Nigerian-First Job Platform • Zero Fees to Apply
            </span>
          </div>

          {/* Core Promise Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1d1d1f] leading-[1.12]">
            The least humiliating way to hunt a job in Nigeria.
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-[16px] sm:text-[19px] text-[#86868b] max-w-2xl mx-auto leading-relaxed">
            Fewer fake posts, a CV you edit once, honest match scores that tell the truth, apply without paying, and a tracker so the chaos lives in one place.
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form
              action="/jobs"
              method="GET"
              className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-full border-2 border-[#d2d2d7] shadow-sm hover:border-[#1d1d1f] focus-within:border-[#1d1d1f] transition-all"
            >
              <div className="flex items-center gap-2.5 px-3 w-full sm:w-auto flex-1">
                <Search className="w-5 h-5 text-[#86868b] shrink-0" />
                <input
                  type="text"
                  name="q"
                  placeholder="Job title, skill (e.g. React, Customer Support, Accountant)..."
                  className="w-full bg-transparent text-[14px] sm:text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-[#e02424] hover:bg-[#c81e1e] active:scale-[0.98] text-white font-semibold text-[14px] px-7 py-3 rounded-xl sm:rounded-full transition-all shrink-0 cursor-pointer shadow-sm"
              >
                Find Jobs
              </button>
            </form>
          </div>

          {/* Quick Filter Chips */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {quickFilterPills.map((pill) => (
              <Link
                key={pill.href}
                href={pill.href}
                className="text-[12px] sm:text-[13px] font-medium text-[#1d1d1f] bg-white hover:bg-gray-50 px-3.5 py-1.5 rounded-full border border-[#d2d2d7] transition-colors shadow-2xs"
              >
                {pill.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Core Loop Infographic (4 Clear Steps) ─── */}
      <section className="py-10 sm:py-14 bg-white border-y border-black/[0.04] px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1d1d1f]">
              How Hoberg Jobs Works For You
            </h2>
            <p className="text-[14px] text-[#86868b] mt-1">
              Never upload the same CV twice. Never pay to apply.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-red-100 text-[#e02424] font-bold flex items-center justify-center text-[14px] mb-3">
                  1
                </div>
                <h3 className="font-semibold text-[15px] text-[#1d1d1f]">Upload Your CV Once</h3>
                <p className="text-[13px] text-[#86868b] mt-1.5 leading-relaxed">
                  We parse your CV into a structured master profile. You review and edit it once — no repeated uploads.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-[14px] mb-3">
                  2
                </div>
                <h3 className="font-semibold text-[15px] text-[#1d1d1f]">Truthful Match Score</h3>
                <p className="text-[13px] text-[#86868b] mt-1.5 leading-relaxed">
                  Clear percentage explained in plain English: what matches, what is missing, and whether foreign roles hire from Nigeria.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-[14px] mb-3">
                  3
                </div>
                <h3 className="font-semibold text-[15px] text-[#1d1d1f]">Apply 100% Free</h3>
                <p className="text-[13px] text-[#86868b] mt-1.5 leading-relaxed">
                  Direct links to official career pages. No application caps, no salary cuts, and zero paywalls to apply.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 font-bold flex items-center justify-center text-[14px] mb-3">
                  4
                </div>
                <h3 className="font-semibold text-[15px] text-[#1d1d1f]">Track Your Pipeline</h3>
                <p className="text-[13px] text-[#86868b] mt-1.5 leading-relaxed">
                  Saved → Applied → Interview → Offer. Keep all follow-up notes and application history in one calm tracker.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Live Job Inventory Section ─── */}
      <section className="py-12 sm:py-16 bg-[#f5f5f7] px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1d1d1f]">
                  Fresh Nigerian &amp; Verified Remote Jobs
                </h2>
              </div>
              <p className="text-[13px] text-[#86868b] mt-1">
                Curated opportunities in Lagos, Abuja, and worldwide roles hiring from Nigeria
              </p>
            </div>

            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#e02424] hover:underline"
            >
              <span>View all open roles</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Job Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => {
              const isLowHireChance = job.hires_from_nigeria === 'no'
              const isDollar = job.salary_range?.includes('$') || job.salary_currency === 'USD'

              return (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="group bg-white rounded-2xl p-5 border border-black/[0.06] hover:border-black/[0.15] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Badges Row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Nigeria or Location Badge */}
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#f5f5f7] text-[#1d1d1f] px-2.5 py-1 rounded-full border border-black/[0.04]">
                          <MapPin className="w-3 h-3 text-[#e02424]" />
                          <span>{job.location || 'Lagos, Nigeria'}</span>
                        </span>

                        {/* Dollar Badge */}
                        {isDollar && (
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                            <span>💵 USD</span>
                          </span>
                        )}

                        {/* Honest Hire from NG Warning */}
                        {isLowHireChance && (
                          <span className="text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                            Low hire chance from NG
                          </span>
                        )}
                      </div>

                      {/* Match Score (if computed) */}
                      {job.match_score && (
                        <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${
                          job.match_score >= 70
                            ? 'bg-emerald-100 text-emerald-800'
                            : job.match_score >= 50
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {job.match_score}% match
                        </span>
                      )}
                    </div>

                    {/* Job Title */}
                    <h3 className="text-[16px] font-semibold text-[#1d1d1f] group-hover:text-[#e02424] transition-colors line-clamp-1">
                      {job.title}
                    </h3>

                    {/* Company Name */}
                    <p className="text-[13px] font-medium text-[#86868b] mt-1 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{job.company_name}</span>
                    </p>

                    {/* Match Reason or Description snippet */}
                    {job.match_reason ? (
                      <p className="text-[12px] text-emerald-700 font-medium mt-2.5 line-clamp-1">
                        ✓ {job.match_reason}
                      </p>
                    ) : (
                      <p className="text-[12px] text-[#86868b] mt-2.5 line-clamp-2">
                        {job.description ? job.description.replace(/<[^>]*>/g, ' ').slice(0, 140) : 'Open remote position.'}
                      </p>
                    )}
                  </div>

                  {/* Bottom Row */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-[#1d1d1f]">
                      {job.salary_range && job.salary_range !== 'Competitive' ? job.salary_range : 'Competitive Salary'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#e02424] font-semibold group-hover:translate-x-0.5 transition-transform">
                      <span>View details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Empty state fallback */}
          {jobs.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl p-8 border border-gray-200">
              <p className="text-base font-semibold text-[#1d1d1f]">No open jobs found in this section.</p>
              <p className="text-sm text-[#86868b] mt-1">Check back shortly or search by keyword.</p>
            </div>
          )}

          {/* View All Button */}
          <div className="mt-10 text-center">
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center gap-2 bg-[#1d1d1f] hover:bg-black text-white font-semibold text-[14px] px-8 py-3.5 rounded-full transition-all shadow-sm"
            >
              <span>Explore All Live Openings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Seeker Promise Banner ─── */}
      <section className="py-14 sm:py-18 bg-white px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#1d1d1f] to-[#2c2c2e] text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-emerald-400 px-3 py-1 rounded-full text-[12px] font-medium mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span>Hoberg Seeker Charter</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
              We never charge candidates to apply. Ever.
            </h2>
            <p className="text-gray-300 text-[14px] sm:text-[15px] mt-3 leading-relaxed">
              Every job listing on Hoberg Jobs is free to view and free to apply. No monthly application limits, no hidden subscription walls on job URLs, and no salary-cut commissions.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {!user ? (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold text-[14px] px-6 py-3 rounded-full transition-all"
                >
                  <span>Sign Up with Google (Free)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/app/cv"
                  className="inline-flex items-center justify-center gap-2 bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold text-[14px] px-6 py-3 rounded-full transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Update Master CV</span>
                </Link>
              )}
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-[14px] px-6 py-3 rounded-full transition-all"
              >
                <span>See Optional AI Tools (Pro)</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Employer Callout ─── */}
      <section className="py-10 bg-[#f5f5f7] border-t border-black/[0.04] px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider">
            Are You Hiring in Nigeria?
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] mt-1">
            Reach thousands of vetted Nigerian professionals.
          </h2>
          <p className="text-[13px] text-[#86868b] mt-2">
            Post your remote or on-site role in Lagos, Abuja, and nationwide for free.
          </p>
          <div className="mt-5">
            <Link
              href="/employers/post"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#1d1d1f] font-semibold text-[13px] px-5 py-2.5 rounded-full border border-[#d2d2d7] transition-all shadow-2xs"
            >
              <span>Post a Job Free</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#e02424]" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
