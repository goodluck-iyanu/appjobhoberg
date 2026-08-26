import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  ChevronRight,
  Palette,
  Code,
  Megaphone,
  Package,
  UserPlus,
  Rocket,
  Crown,
  ArrowRight,
  Sparkles,
} from '@/components/icons'

export default async function Home() {
  const supabase = await createClient()

  // Fetch open jobs from the database
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  const categories = [
    { label: 'Design', icon: Palette },
    { label: 'Engineering', icon: Code },
    { label: 'Marketing', icon: Megaphone },
    { label: 'Product', icon: Package },
  ]

  return (
    <div className="flex-1 bg-white">
      {/* ─── Hero Section ─── */}
      <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-[#f5f5f7] border border-[#d2d2d7] rounded-full px-4 py-1.5 mb-8">
            <span className="text-sm">✨</span>
            <span className="text-[13px] font-medium text-[#1d1d1f] tracking-wide">
              Now Hiring Remotely
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-[40px] sm:text-[56px] md:text-[72px] lg:text-[80px] font-semibold tracking-tight text-[#1d1d1f] leading-[1.05] mb-6">
            Find your next
            <br className="hidden sm:block" />
            remote opportunity.
          </h1>

          {/* Subtitle */}
          <p className="text-[17px] sm:text-[19px] md:text-[21px] text-[#86868b] max-w-2xl mx-auto font-medium mb-10 leading-relaxed">
            Hoberg Jobs connects you with hand-picked remote roles from
            top companies worldwide. Browse, apply, and land your dream
            job—all in one place.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white border border-[#d2d2d7] rounded-full p-1.5 flex items-center shadow-[0_2px_14px_rgba(0,0,0,0.04)] focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-[#0066cc] transition-all">
              <div className="pl-4 pr-3 text-[#86868b]">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search by job title, skill, or company..."
                className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 text-[#1d1d1f] placeholder-[#86868b] outline-none text-[15px] sm:text-[17px] py-3"
              />
              <button className="bg-[#0066cc] hover:bg-[#0077ed] text-white font-medium px-5 sm:px-6 py-3 rounded-full transition-colors text-[14px] sm:text-[15px] whitespace-nowrap">
                Search
              </button>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {categories.map(({ label, icon: Icon }) => (
              <button
                key={label}
                className="inline-flex items-center gap-2 bg-white border border-[#d2d2d7] rounded-full px-4 py-2 text-[14px] font-medium text-[#1d1d1f] hover:border-[#0066cc] hover:text-[#0066cc] transition-colors"
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Jobs Section ─── */}
      <section className="bg-[#f5f5f7] py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Section header */}
          <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-[#d2d2d7]">
            <h2 className="text-[22px] sm:text-[28px] font-semibold text-[#1d1d1f]">
              Latest Opportunities
            </h2>
            <span className="text-[14px] sm:text-[15px] text-[#86868b]">
              {jobs?.length || 0} results
            </span>
          </div>

          {/* Error state */}
          {error ? (
            <div className="bg-white border border-[#d2d2d7] rounded-2xl p-8 sm:p-12 text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#1d1d1f] mb-2">
                Something went wrong
              </h3>
              <p className="text-[15px] text-[#86868b] max-w-md mx-auto">
                We couldn&apos;t load the latest jobs right now. Please try
                refreshing the page or check back in a moment.
              </p>
            </div>
          ) : !jobs || jobs.length === 0 ? (
            /* Empty state */
            <div className="bg-white border border-[#d2d2d7] rounded-2xl p-8 sm:p-16 text-center">
              <div className="w-16 h-16 bg-[#f5f5f7] rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-8 h-8 text-[#86868b]" />
              </div>
              <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#1d1d1f] mb-2">
                No jobs available yet
              </h3>
              <p className="text-[15px] text-[#86868b] max-w-sm mx-auto">
                New opportunities are added regularly. Check back soon or
                join our waitlist to get notified.
              </p>
            </div>
          ) : (
            /* Job cards */
            <div className="space-y-4">
              {jobs.map((job) => (
                <Link
                  href={`/jobs/${job.id}`}
                  key={job.id}
                  className="block group"
                >
                  <div className="bg-white border border-[#d2d2d7] rounded-2xl p-5 sm:p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-[#86868b] transition-all duration-300">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: icon + info */}
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[#f5f5f7] rounded-[12px] sm:rounded-[14px] flex items-center justify-center shrink-0 border border-[#d2d2d7]/50">
                          <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#1d1d1f]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[17px] sm:text-[20px] font-semibold text-[#1d1d1f] group-hover:text-[#0066cc] transition-colors leading-tight mb-1 truncate">
                            {job.title}
                          </h3>
                          <p className="text-[14px] sm:text-[15px] text-[#86868b] mb-3">
                            {job.company_name}
                          </p>

                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-[#1d1d1f] bg-[#f5f5f7] px-2.5 py-1 rounded-md">
                              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#86868b]" />
                              {job.is_remote ? 'Remote' : job.location}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-[#1d1d1f] bg-[#f5f5f7] px-2.5 py-1 rounded-md">
                              <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#86868b]" />
                              {job.employment_type}
                            </span>
                            {job.salary_range && (
                              <span className="inline-flex items-center text-[12px] sm:text-[13px] font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-100">
                                {job.salary_range}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: chevron */}
                      <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-[#f5f5f7] text-[#86868b] group-hover:bg-[#0066cc] group-hover:text-white transition-colors shrink-0 self-center">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Premium CTA Section ─── */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-[#1d1d1f] to-[#2d2d30]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-8">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-[13px] font-medium text-white/90 tracking-wide">
              Premium
            </span>
          </div>

          <h2 className="text-[32px] sm:text-[40px] md:text-[48px] font-semibold text-white tracking-tight leading-tight mb-5">
            Get access to curated
            <br className="hidden sm:block" />
            premium opportunities.
          </h2>

          <p className="text-[17px] sm:text-[19px] text-white/60 max-w-xl mx-auto leading-relaxed mb-10">
            Hand-picked roles from vetted companies, early access to new
            listings, and priority application review. Invest in your career.
          </p>

          {/* Pricing */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-10">
            <div className="text-center">
              <p className="text-[14px] text-white/40 mb-1 line-through">
                ₦5,000/month
              </p>
              <p className="text-[32px] sm:text-[36px] font-semibold text-white">
                ₦4,000
                <span className="text-[16px] font-normal text-white/50">
                  /month
                </span>
              </p>
              <p className="text-[13px] text-amber-400 font-medium mt-1">
                Founding member — 20% off forever
              </p>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/premium/waitlist"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#1d1d1f] font-semibold px-8 py-3.5 rounded-full text-[15px] hover:bg-white/90 transition-colors"
            >
              Join Waitlist
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/premium"
              className="w-full sm:w-auto inline-flex items-center justify-center text-[15px] font-medium text-white/70 hover:text-white transition-colors px-6 py-3.5"
            >
              Learn more →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── How It Works Section ─── */}
      <section className="py-16 sm:py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-semibold text-[#1d1d1f] tracking-tight mb-4">
              How Hoberg Jobs works
            </h2>
            <p className="text-[17px] text-[#86868b] max-w-lg mx-auto">
              Three simple steps to your next remote career move.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {/* Step 1 */}
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-[#f5f5f7] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#d2d2d7]/60">
                <Search className="w-7 h-7 text-[#0066cc]" />
              </div>
              <div className="text-[12px] font-semibold text-[#0066cc] uppercase tracking-widest mb-2">
                Step 1
              </div>
              <h3 className="text-[20px] font-semibold text-[#1d1d1f] mb-2">
                Browse Jobs
              </h3>
              <p className="text-[15px] text-[#86868b] leading-relaxed">
                Explore curated remote opportunities from top companies across
                every industry and skill level.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-[#f5f5f7] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#d2d2d7]/60">
                <UserPlus className="w-7 h-7 text-[#0066cc]" />
              </div>
              <div className="text-[12px] font-semibold text-[#0066cc] uppercase tracking-widest mb-2">
                Step 2
              </div>
              <h3 className="text-[20px] font-semibold text-[#1d1d1f] mb-2">
                Create Profile
              </h3>
              <p className="text-[15px] text-[#86868b] leading-relaxed">
                Build a standout profile that highlights your skills,
                experience, and what makes you unique.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-[#f5f5f7] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#d2d2d7]/60">
                <Rocket className="w-7 h-7 text-[#0066cc]" />
              </div>
              <div className="text-[12px] font-semibold text-[#0066cc] uppercase tracking-widest mb-2">
                Step 3
              </div>
              <h3 className="text-[20px] font-semibold text-[#1d1d1f] mb-2">
                Apply & Track
              </h3>
              <p className="text-[15px] text-[#86868b] leading-relaxed">
                Submit applications with one click and track your progress
                in real time from a single dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
