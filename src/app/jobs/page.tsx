import Link from 'next/link'
import { fetchLiveJobs } from '@/utils/jobs'
import { createClient } from '@/utils/supabase/server'
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  ChevronRight,
  ArrowLeft,
  DollarSign,
  ShieldCheck,
  Bookmark,
  Sparkles,
} from '@/components/icons'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; loc?: string; city?: string; type?: string; dollar?: string }>
}) {
  const params = await searchParams
  const q = params.q
  const cat = params.cat
  const loc = params.loc
  const city = params.city
  const type = params.type
  const dollar = params.dollar === 'true'

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

  const jobs = await fetchLiveJobs({
    query: q,
    category: cat,
    location: loc,
    city: city,
    workType: type,
    dollarOnly: dollar,
    userProfile,
  })

  const filterChips = [
    { label: 'All Jobs', href: '/jobs', active: !q && !cat && !loc && !city && !dollar },
    { label: '🇳🇬 Lagos', href: '/jobs/lagos', active: city === 'lagos' || q?.toLowerCase() === 'lagos' },
    { label: '🏛️ Abuja', href: '/jobs/abuja', active: city === 'abuja' || q?.toLowerCase() === 'abuja' },
    { label: '🌐 Remote (Nigeria)', href: '/jobs/remote-nigeria', active: loc?.toLowerCase().includes('nigeria') },
    { label: '💵 Dollar Remote', href: '/jobs/remote-dollar', active: dollar },
    { label: '🎓 NYSC & Graduate', href: '/jobs/graduate', active: cat === 'graduate' },
    { label: '💻 Tech & Dev', href: '/jobs/software-developer-nigeria', active: cat === 'dev' || cat === 'engineering' },
    { label: '🎧 Customer Support', href: '/jobs/customer-service', active: cat === 'support' },
  ]

  return (
    <div className="flex-1 bg-[#f5f5f7] py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb & Heading */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[12px] text-[#86868b] hover:text-[#1d1d1f] mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
                Explore Verified Job Openings
              </h1>
              <p className="text-[13px] text-[#86868b] mt-1">
                Showing {jobs.length} curated roles • Apply is always free
              </p>
            </div>
            {!user && (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#e02424] bg-white border border-[#d2d2d7] px-3.5 py-1.5 rounded-full shadow-2xs self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Sign in to see truthful match %</span>
              </Link>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-3 border border-black/[0.06] shadow-xs mb-6">
          <form method="GET" action="/jobs" className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#f5f5f7] rounded-xl flex-1">
              <Search className="w-4 h-4 text-[#86868b] shrink-0" />
              <input
                type="text"
                name="q"
                defaultValue={q || ''}
                placeholder="Search job title, company, or keyword..."
                className="w-full bg-transparent text-[14px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="bg-[#1d1d1f] hover:bg-black text-white font-semibold text-[13px] px-6 py-2.5 rounded-xl transition-all cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>

          {/* Location / Hub Filter Chips */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
            {filterChips.map((chip) => (
              <Link
                key={chip.href}
                href={chip.href}
                className={`text-[12px] font-medium px-3 py-1 rounded-full transition-colors ${
                  chip.active
                    ? 'bg-[#e02424] text-white font-semibold shadow-xs'
                    : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-gray-200/80 border border-black/[0.04]'
                }`}
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-3.5">
          {jobs.map((job) => {
            const isLowHireChance = job.hires_from_nigeria === 'no'
            const isDollar = job.salary_range?.includes('$') || job.salary_currency === 'USD'

            return (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="group block bg-white rounded-2xl p-5 border border-black/[0.06] hover:border-black/[0.15] hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    {/* Top Row Badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#f5f5f7] text-[#1d1d1f] px-2.5 py-0.5 rounded-full border border-black/[0.04]">
                        <MapPin className="w-3 h-3 text-[#e02424]" />
                        <span>{job.location || 'Lagos, Nigeria'}</span>
                      </span>

                      {isDollar && (
                        <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                          💵 USD
                        </span>
                      )}

                      {isLowHireChance && (
                        <span className="text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                          Low hire chance from NG
                        </span>
                      )}

                      <span className="text-[11px] text-[#86868b]">
                        • {job.source || 'Verified Feed'}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-[16px] sm:text-[17px] font-semibold text-[#1d1d1f] group-hover:text-[#e02424] transition-colors">
                      {job.title}
                    </h2>

                    {/* Company */}
                    <p className="text-[13px] font-medium text-[#86868b] mt-0.5 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{job.company_name}</span>
                    </p>

                    {/* Match Score Reason (if logged in) */}
                    {job.match_reason && (
                      <p className="text-[12px] text-emerald-700 font-medium mt-2">
                        ✓ {job.match_reason}
                      </p>
                    )}

                    {/* Missing Keywords (if any) */}
                    {job.missing_keywords && job.missing_keywords.length > 0 && (
                      <p className="text-[11px] text-[#86868b] mt-1">
                        Missing from profile: <span className="text-amber-700 font-medium">{job.missing_keywords.join(', ')}</span>
                      </p>
                    )}
                  </div>

                  {/* Right side: Match score & salary */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    {job.match_score ? (
                      <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${
                        job.match_score >= 70
                          ? 'bg-emerald-100 text-emerald-800'
                          : job.match_score >= 50
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {job.match_score}% match
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#86868b] hidden sm:inline">
                        100% Free to apply
                      </span>
                    )}

                    <span className="text-[13px] font-semibold text-[#1d1d1f]">
                      {job.salary_range && job.salary_range !== 'Competitive' ? job.salary_range : 'Competitive'}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Empty State */}
        {jobs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl p-8 border border-gray-200 mt-4">
            <h3 className="text-base font-semibold text-[#1d1d1f]">No open jobs match this filter.</h3>
            <p className="text-[13px] text-[#86868b] mt-1 max-w-sm mx-auto">
              We never show fake filler jobs. Try searching for a broader term or check our Lagos or Remote NG hubs.
            </p>
            <div className="mt-5">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 bg-[#1d1d1f] text-white font-semibold text-[13px] px-5 py-2.5 rounded-full"
              >
                Clear all filters
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
