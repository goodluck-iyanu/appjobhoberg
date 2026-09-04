import Link from 'next/link'
import { fetchLiveJobs } from '@/utils/jobs'
import { createClient } from '@/utils/supabase/server'
import {
  MapPin,
  Building2,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Briefcase,
  DollarSign,
  CheckCircle,
} from '@/components/icons'

interface JobHubProps {
  title: string
  subtitle: string
  locationBadge: string
  filterOptions: {
    city?: string
    location?: string
    category?: string
    dollarOnly?: boolean
    nigeriaOnly?: boolean
    workType?: string
  }
}

export default async function JobHubPage({
  title,
  subtitle,
  locationBadge,
  filterOptions,
}: JobHubProps) {
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
    ...filterOptions,
    userProfile,
  })

  return (
    <div className="flex-1 bg-[#f5f5f7] py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1 text-[12px] text-[#86868b] hover:text-[#1d1d1f] mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Jobs</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[12px] font-medium bg-white text-[#1d1d1f] border border-[#d2d2d7] px-3 py-1 rounded-full mb-2 shadow-2xs">
                <span>{locationBadge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
                {title}
              </h1>
              <p className="text-[14px] text-[#86868b] mt-1">{subtitle}</p>
            </div>

            {!user && (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#e02424] bg-white border border-[#d2d2d7] px-4 py-2 rounded-full shadow-2xs self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Check Match (Free)</span>
              </Link>
            )}
          </div>
        </div>

        {/* Quick Nav Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href="/jobs"
            className="text-[12px] font-medium px-3.5 py-1.5 rounded-full bg-white text-[#1d1d1f] border border-[#d2d2d7] hover:bg-gray-50"
          >
            All Openings
          </Link>
          <Link
            href="/jobs/lagos"
            className="text-[12px] font-medium px-3.5 py-1.5 rounded-full bg-white text-[#1d1d1f] border border-[#d2d2d7] hover:bg-gray-50"
          >
            📍 Lagos
          </Link>
          <Link
            href="/jobs/remote-nigeria"
            className="text-[12px] font-medium px-3.5 py-1.5 rounded-full bg-white text-[#1d1d1f] border border-[#d2d2d7] hover:bg-gray-50"
          >
            🌐 Remote NG
          </Link>
          <Link
            href="/jobs/remote-dollar"
            className="text-[12px] font-medium px-3.5 py-1.5 rounded-full bg-white text-[#1d1d1f] border border-[#d2d2d7] hover:bg-gray-50"
          >
            💵 Dollar Remote
          </Link>
        </div>

        {/* Listings */}
        <div className="space-y-3.5">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="group block bg-white rounded-2xl p-5 border border-black/[0.06] hover:border-black/[0.15] hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#f5f5f7] text-[#1d1d1f] px-2.5 py-0.5 rounded-full border border-black/[0.04]">
                      <MapPin className="w-3 h-3 text-[#e02424]" />
                      <span>{job.location || 'Lagos, Nigeria'}</span>
                    </span>
                    <span className="text-[11px] text-[#86868b]">
                      • {job.source || 'Verified Feed'}
                    </span>
                  </div>

                  <h2 className="text-[16px] sm:text-[17px] font-semibold text-[#1d1d1f] group-hover:text-[#e02424] transition-colors">
                    {job.title}
                  </h2>

                  <p className="text-[13px] font-medium text-[#86868b] mt-0.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{job.company_name}</span>
                  </p>

                  {job.match_reason && (
                    <p className="text-[12px] text-emerald-700 font-medium mt-2">
                      ✓ {job.match_reason}
                    </p>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  {job.match_score ? (
                    <span className="text-[12px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {job.match_score}% match
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#86868b] hidden sm:inline">
                      Free to apply
                    </span>
                  )}
                  <span className="text-[13px] font-semibold text-[#1d1d1f]">
                    {job.salary_range && job.salary_range !== 'Competitive' ? job.salary_range : 'Competitive'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {jobs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl p-8 border border-gray-200 mt-4">
            <h3 className="text-base font-semibold text-[#1d1d1f]">No open roles found in this hub right now.</h3>
            <p className="text-[13px] text-[#86868b] mt-1 max-w-sm mx-auto">
              We update feeds daily from verified Nigerian employers and remote teams. Check all jobs or set an alert.
            </p>
            <div className="mt-5">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 bg-[#1d1d1f] text-white font-semibold text-[13px] px-5 py-2.5 rounded-full"
              >
                Browse All Openings
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

