import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { FALLBACK_JOBS, Job } from '@/data/jobs'
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  ChevronRight,
  Filter,
} from '@/components/icons'

export default async function JobsPage() {
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

  return (
    <div className="flex-1 bg-[#f5f5f7] py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-[30px] sm:text-[38px] font-semibold text-[#1d1d1f] tracking-tight">
            Find Remote Jobs
          </h1>
          <p className="text-[15px] sm:text-[17px] text-[#86868b] mt-1">
            Discover {jobs.length}+ legitimate, verified remote opportunities.
          </p>
        </div>

        {/* Search */}
        <div className="bg-white border border-[#d2d2d7] rounded-2xl p-3 sm:p-4 mb-8 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center bg-[#f5f5f7] rounded-xl px-3.5 py-2.5">
            <Search className="w-5 h-5 text-[#86868b] mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by title, technology, or company..."
              className="w-full bg-transparent border-none outline-none text-[#1d1d1f] placeholder-[#86868b] text-[15px]"
            />
          </div>
          <button className="bg-[#0066cc] hover:bg-[#0077ed] text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-[15px]">
            Filter Results
          </button>
        </div>

        {/* Job Cards */}
        <div className="space-y-3.5 sm:space-y-4">
          {jobs.map((job) => (
            <Link
              href={`/jobs/${job.id}`}
              key={job.id}
              className="block group"
            >
              <div className="bg-white border border-[#d2d2d7]/70 rounded-2xl p-4 sm:p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-[#86868b] transition-all duration-200">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#f5f5f7] rounded-xl flex items-center justify-center shrink-0 border border-[#d2d2d7]/50 mt-0.5">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#1d1d1f]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[16px] sm:text-[19px] font-semibold text-[#1d1d1f] group-hover:text-[#0066cc] transition-colors leading-snug mb-0.5">
                        {job.title}
                      </h3>
                      <p className="text-[13px] sm:text-[14px] font-medium text-[#86868b] mb-3">
                        {job.company_name}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] sm:text-[12px] font-medium text-[#1d1d1f] bg-[#f5f5f7] px-2.5 py-1 rounded-md">
                          <MapPin className="w-3 h-3 text-[#86868b]" />
                          {job.is_remote ? 'Remote' : job.location}
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

                  <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-[#f5f5f7] text-[#86868b] group-hover:bg-[#0066cc] group-hover:text-white transition-colors shrink-0 self-center">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
