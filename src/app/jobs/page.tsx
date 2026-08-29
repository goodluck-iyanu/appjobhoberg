import Link from 'next/link'
import { fetchLiveJobs } from '@/utils/jobs'
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  ChevronRight,
  ArrowLeft,
} from '@/components/icons'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; loc?: string }>
}) {
  const { q, cat, loc } = await searchParams

  const jobs = await fetchLiveJobs({
    query: q,
    category: cat,
    location: loc,
  })

  const filterChips = [
    { label: 'All Jobs', href: '/jobs', active: !q && !cat && !loc },
    { label: '🇳🇬 Nigeria & Africa', href: '/jobs?q=Nigeria', active: q?.toLowerCase() === 'nigeria' },
    { label: '🎧 Customer Support', href: '/jobs?cat=support', active: cat === 'support' },
    { label: '✍️ Writing & Content', href: '/jobs?cat=writing', active: cat === 'writing' },
    { label: '💼 Virtual Assistant / Admin', href: '/jobs?cat=admin', active: cat === 'admin' },
    { label: '💰 Finance & Accounting', href: '/jobs?cat=finance', active: cat === 'finance' },
    { label: '📈 Marketing & Sales', href: '/jobs?cat=marketing', active: cat === 'marketing' },
    { label: '💻 Software & Tech', href: '/jobs?cat=dev', active: cat === 'dev' },
  ]

  return (
    <div className="flex-1 bg-[#f5f5f7] py-8 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <Link
            href="/"
            className="inline-flex items-center text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f] mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Home
          </Link>
          <h1 className="text-[28px] sm:text-[36px] font-semibold text-[#1d1d1f] tracking-tight">
            {q ? `Jobs matching "${q}"` : cat ? `${cat.toUpperCase()} Remote Jobs` : 'All Remote Jobs'}
          </h1>
          <p className="text-[14px] sm:text-[16px] text-[#86868b] mt-1">
            Showing {jobs.length} verified live opportunities across all industries
          </p>
        </div>

        {/* Search Bar Form */}
        <form
          action="/jobs"
          method="GET"
          className="bg-white border border-[#d2d2d7] rounded-2xl p-2 sm:p-3 mb-4 shadow-sm flex flex-col sm:flex-row gap-2"
        >
          <div className="flex-1 flex items-center bg-[#f5f5f7] rounded-xl px-3.5 py-2.5">
            <Search className="w-4 h-4 text-[#86868b] mr-2.5 shrink-0" />
            <input
              type="text"
              name="q"
              defaultValue={q || ''}
              placeholder="Search keyword (e.g. Customer Care, Virtual Assistant, Writer, Finance, Nigeria)..."
              className="w-full bg-transparent border-none outline-none text-[#1d1d1f] placeholder-[#86868b] text-[14px] sm:text-[15px]"
            />
          </div>
          <button
            type="submit"
            className="bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-[14px] sm:text-[15px] cursor-pointer shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {filterChips.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className={`shrink-0 text-[12px] sm:text-[13px] font-medium px-3.5 py-1.5 rounded-full transition-colors ${
                chip.active
                  ? 'bg-[#e02424] text-white'
                  : 'bg-white border border-[#d2d2d7] text-[#1d1d1f] hover:border-[#e02424] hover:text-[#e02424]'
              }`}
            >
              {chip.label}
            </Link>
          ))}
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white border border-[#d2d2d7] rounded-2xl p-12 text-center">
            <Briefcase className="w-10 h-10 text-[#86868b] mx-auto mb-3" />
            <h3 className="text-[18px] font-semibold text-[#1d1d1f] mb-1">
              No matching jobs found
            </h3>
            <p className="text-[14px] text-[#86868b] mb-4">
              Try searching with broader terms or choose another category.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center text-[14px] font-semibold text-[#e02424] hover:underline"
            >
              Show all remote jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-3.5">
            {jobs.map((job) => (
              <Link
                href={`/jobs/${job.id}`}
                key={job.id}
                className="block group"
              >
                <div className="bg-white border border-[#d2d2d7]/70 rounded-2xl p-4 sm:p-5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-[#86868b] transition-all duration-200">
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                      {job.company_logo_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={job.company_logo_url}
                          alt={job.company_name}
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-contain bg-[#f5f5f7] border border-[#d2d2d7]/50 p-1 shrink-0 mt-0.5"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#f5f5f7] rounded-xl flex items-center justify-center shrink-0 border border-[#d2d2d7]/50 mt-0.5">
                          <Building2 className="w-5 h-5 text-[#1d1d1f]" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[16px] sm:text-[18px] font-semibold text-[#1d1d1f] group-hover:text-[#e02424] transition-colors leading-snug mb-0.5">
                          {job.title}
                        </h3>
                        <p className="text-[13px] sm:text-[14px] font-medium text-[#86868b] mb-2.5">
                          {job.company_name}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] sm:text-[12px] font-medium text-[#1d1d1f] bg-[#f5f5f7] px-2 py-0.5 rounded-md">
                            <MapPin className="w-3 h-3 text-[#86868b]" />
                            {job.location}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] sm:text-[12px] font-medium text-[#1d1d1f] bg-[#f5f5f7] px-2 py-0.5 rounded-md">
                            <Briefcase className="w-3 h-3 text-[#86868b]" />
                            {job.employment_type}
                          </span>
                          {job.category && (
                            <span className="inline-flex items-center text-[11px] sm:text-[12px] font-semibold text-[#e02424] bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                              {job.category}
                            </span>
                          )}
                          {job.salary_range && (
                            <span className="inline-flex items-center text-[11px] sm:text-[12px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              {job.salary_range}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-[#f5f5f7] text-[#86868b] group-hover:bg-[#e02424] group-hover:text-white transition-colors shrink-0 self-center">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
