import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { FALLBACK_JOBS, Job } from '@/data/jobs'
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
  ShieldCheck,
  CheckCircle,
} from '@/components/icons'

export default async function Home() {
  let jobs: Job[] = []

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) {
      jobs = data as Job[]
    } else {
      jobs = FALLBACK_JOBS
    }
  } catch {
    jobs = FALLBACK_JOBS
  }

  const categories = [
    { label: 'Engineering', icon: Code, count: '12 roles' },
    { label: 'Design', icon: Palette, count: '8 roles' },
    { label: 'Marketing', icon: Megaphone, count: '6 roles' },
    { label: 'Product', icon: Package, count: '5 roles' },
  ]

  return (
    <div className="flex-1 bg-white">
      {/* ─── Hero Section ─── */}
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-[#f5f5f7] border border-[#d2d2d7] rounded-full px-4 py-1.5 mb-6 sm:mb-8">
            <span className="text-sm">✨</span>
            <span className="text-[12px] sm:text-[13px] font-semibold text-[#1d1d1f] tracking-wide">
              Curated by Hoberg Digital Agency
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-[36px] sm:text-[56px] md:text-[72px] lg:text-[80px] font-semibold tracking-tight text-[#1d1d1f] leading-[1.08] mb-6">
            Find your next
            <br className="hidden sm:block" />
            <span className="text-[#0066cc]"> remote opportunity.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[16px] sm:text-[19px] md:text-[21px] text-[#86868b] max-w-2xl mx-auto font-normal mb-8 sm:mb-10 leading-relaxed px-2">
            Discover legitimate, verified remote opportunities worldwide. Build your profile, save jobs, and track your applications securely.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 px-2">
            <div className="bg-white border border-[#d2d2d7] rounded-full p-1.5 flex items-center shadow-[0_2px_14px_rgba(0,0,0,0.04)] focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-[#0066cc] transition-all">
              <div className="pl-3 sm:pl-4 pr-2 sm:pr-3 text-[#86868b]">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search job title, skills, or company..."
                className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 text-[#1d1d1f] placeholder-[#86868b] outline-none text-[14px] sm:text-[16px] py-2 sm:py-3"
              />
              <Link
                href="/jobs"
                className="bg-[#0066cc] hover:bg-[#0077ed] text-white font-medium px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-colors text-[13px] sm:text-[15px] whitespace-nowrap"
              >
                Search
              </Link>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-2">
            {categories.map(({ label, icon: Icon, count }) => (
              <Link
                key={label}
                href="/jobs"
                className="inline-flex items-center gap-2 bg-white border border-[#d2d2d7] rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-[13px] sm:text-[14px] font-medium text-[#1d1d1f] hover:border-[#0066cc] hover:text-[#0066cc] transition-colors"
              >
                <Icon className="w-4 h-4 text-[#86868b]" />
                <span>{label}</span>
                <span className="text-[11px] text-[#86868b] hidden sm:inline">({count})</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Jobs Section ─── */}
      <section className="bg-[#f5f5f7] py-14 sm:py-20 border-t border-b border-black/[0.04]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Section header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8 pb-4 border-b border-[#d2d2d7]">
            <div>
              <h2 className="text-[20px] sm:text-[26px] font-semibold text-[#1d1d1f] tracking-tight">
                Verified Remote Jobs
              </h2>
              <p className="text-[13px] sm:text-[14px] text-[#86868b] mt-0.5">
                Hand-picked &amp; legitimate opportunities
              </p>
            </div>
            <Link
              href="/jobs"
              className="text-[13px] sm:text-[14px] font-medium text-[#0066cc] hover:underline flex items-center gap-1"
            >
              View all <span className="hidden sm:inline">({jobs.length})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Job cards list */}
          <div className="space-y-3.5 sm:space-y-4">
            {jobs.map((job) => (
              <Link
                href={`/jobs/${job.id}`}
                key={job.id}
                className="block group"
              >
                <div className="bg-white border border-[#d2d2d7]/70 rounded-2xl p-4 sm:p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-[#86868b] transition-all duration-200">
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    {/* Left: icon + info */}
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#f5f5f7] rounded-[12px] sm:rounded-[14px] flex items-center justify-center shrink-0 border border-[#d2d2d7]/50 mt-0.5">
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#1d1d1f]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-[16px] sm:text-[19px] font-semibold text-[#1d1d1f] group-hover:text-[#0066cc] transition-colors leading-snug">
                            {job.title}
                          </h3>
                        </div>
                        <p className="text-[13px] sm:text-[14px] font-medium text-[#86868b] mb-3">
                          {job.company_name}
                        </p>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] sm:text-[12px] font-medium text-[#1d1d1f] bg-[#f5f5f7] px-2.5 py-1 rounded-md">
                            <MapPin className="w-3 h-3 text-[#86868b]" />
                            {job.is_remote ? '100% Remote' : job.location}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] sm:text-[12px] font-medium text-[#1d1d1f] bg-[#f5f5f7] px-2.5 py-1 rounded-md">
                            <Briefcase className="w-3 h-3 text-[#86868b]" />
                            {job.employment_type}
                          </span>
                          {job.salary_range && (
                            <span className="inline-flex items-center text-[11px] sm:text-[12px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                              {job.salary_range}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: chevron button */}
                    <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-[#f5f5f7] text-[#86868b] group-hover:bg-[#0066cc] group-hover:text-white transition-colors shrink-0 self-center">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Premium Section ─── */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-br from-[#1d1d1f] via-[#242427] to-[#1d1d1f] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-6">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-[12px] sm:text-[13px] font-semibold text-white tracking-wide uppercase">
              Hoberg Premium
            </span>
          </div>

          <h2 className="text-[28px] sm:text-[42px] font-semibold tracking-tight leading-tight mb-4">
            Curated opportunities for top talent.
          </h2>

          <p className="text-[15px] sm:text-[17px] text-white/70 max-w-xl mx-auto mb-8 leading-relaxed">
            Get exclusive access to hand-selected opportunities, tailored application tips, and direct recruiter visibility.
          </p>

          {/* Pricing pill */}
          <div className="inline-block bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 text-left max-w-md w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-semibold text-white/80 uppercase tracking-wider">
                Founding Member Offer
              </span>
              <span className="text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                20% OFF
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-bold text-white">₦4,000</span>
              <span className="text-[14px] text-white/50">/ month</span>
              <span className="text-[14px] text-white/40 line-through ml-2">₦5,000</span>
            </div>
            <p className="text-[12px] text-white/60 mt-2">
              Lock in your founding discount forever by joining the waitlist today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/premium/waitlist"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#0066cc] hover:bg-[#0077ed] text-white font-medium px-8 py-3.5 rounded-full transition-colors text-[15px]"
            >
              Join Founding Waitlist
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/premium"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white/10 hover:bg-white/15 text-white font-medium px-6 py-3.5 rounded-full transition-colors text-[15px] border border-white/10"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-16 sm:py-24 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-[24px] sm:text-[34px] font-semibold text-[#1d1d1f] tracking-tight mb-3">
            How Hoberg Jobs Works
          </h2>
          <p className="text-[15px] sm:text-[17px] text-[#86868b]">
            Simple, transparent, and built for modern remote professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Browse Freely',
              desc: 'Search hundreds of verified remote jobs without needing to create an account first.',
              icon: Search,
            },
            {
              step: '02',
              title: 'Build Profile',
              desc: 'Create an account to save favorite roles, upload CV, and add your skills & links.',
              icon: UserPlus,
            },
            {
              step: '03',
              title: 'Apply & Track',
              desc: 'Apply directly to legitimate employers and track application statuses in one dashboard.',
              icon: Rocket,
            },
          ].map(({ step, title, desc, icon: Icon }) => (
            <div
              key={step}
              className="bg-[#f5f5f7] border border-[#d2d2d7]/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-[#d2d2d7]/60 shadow-sm">
                    <Icon className="w-5 h-5 text-[#0066cc]" />
                  </div>
                  <span className="text-[13px] font-bold text-[#86868b] tracking-wider">
                    {step}
                  </span>
                </div>
                <h3 className="text-[18px] font-semibold text-[#1d1d1f] mb-2">
                  {title}
                </h3>
                <p className="text-[14px] text-[#86868b] leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
