import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FALLBACK_JOBS, Job } from '@/data/jobs'
import {
  MapPin,
  Briefcase,
  Clock,
  Building2,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  Calendar,
} from '@/components/icons'

export default async function JobDetails({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let job: Job | null = null

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      job = data as Job
    }
  } catch {
    // Database check failed, fallback to in-memory jobs
  }

  if (!job) {
    job = FALLBACK_JOBS.find((j) => j.id === id) || null
  }

  if (!job) {
    notFound()
  }

  // Check auth
  let user = null
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
  } catch {
    user = null
  }

  return (
    <div className="flex-1 bg-[#f5f5f7] py-8 sm:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center text-[14px] font-medium text-[#0066cc] hover:underline mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to all jobs
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-[#d2d2d7]/50 overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-10 border-b border-[#f5f5f7]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#f5f5f7] rounded-2xl flex items-center justify-center shrink-0 border border-[#d2d2d7]/50">
                  <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-[#1d1d1f]" />
                </div>
                <div>
                  <h1 className="text-[22px] sm:text-[30px] font-semibold text-[#1d1d1f] tracking-tight leading-snug mb-1">
                    {job.title}
                  </h1>
                  <p className="text-[15px] sm:text-[17px] text-[#86868b] font-medium">
                    {job.company_name}
                  </p>
                </div>
              </div>

              {/* Apply button desktop / mobile */}
              <div className="shrink-0 flex flex-col items-stretch sm:items-end">
                {user ? (
                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-[#0066cc] hover:bg-[#0077ed] text-white font-medium px-6 py-3 rounded-full transition-colors text-[15px] shadow-sm"
                  >
                    Apply Now
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center bg-[#0066cc] hover:bg-[#0077ed] text-white font-medium px-6 py-3 rounded-full transition-colors text-[15px] shadow-sm"
                  >
                    Sign in to Apply
                  </Link>
                )}
                {!user && (
                  <p className="text-[12px] text-[#86868b] mt-2 text-center sm:text-right">
                    Free account required
                  </p>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-6 pt-6 border-t border-black/[0.04]">
              <span className="inline-flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-[#1d1d1f] bg-[#f5f5f7] px-3 py-1.5 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-[#86868b]" />
                {job.is_remote ? '100% Remote' : job.location}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-[#1d1d1f] bg-[#f5f5f7] px-3 py-1.5 rounded-lg">
                <Briefcase className="w-3.5 h-3.5 text-[#86868b]" />
                {job.employment_type}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-[#1d1d1f] bg-[#f5f5f7] px-3 py-1.5 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-[#86868b]" />
                Posted {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Description & Requirements */}
          <div className="p-6 sm:p-10 space-y-8">
            <div>
              <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#1d1d1f] mb-3">
                About this role
              </h2>
              <div className="text-[15px] sm:text-[16px] text-[#1d1d1f]/85 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {job.requirements && (
              <div>
                <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#1d1d1f] mb-3">
                  Requirements
                </h2>
                <div className="text-[15px] sm:text-[16px] text-[#1d1d1f]/85 leading-relaxed whitespace-pre-line">
                  {job.requirements}
                </div>
              </div>
            )}

            {job.salary_range && (
              <div className="bg-[#f5f5f7] rounded-2xl p-5 sm:p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#0066cc] shadow-sm border border-[#d2d2d7]/40">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-0.5">
                    Compensation
                  </h3>
                  <p className="text-[18px] sm:text-[20px] font-semibold text-[#1d1d1f]">
                    {job.salary_range}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Security Notice */}
          <div className="bg-[#fafafc] p-6 sm:p-8 border-t border-black/[0.04] flex items-start gap-3.5 text-[13px] text-[#86868b] leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-[#0066cc] shrink-0 mt-0.5" />
            <p>
              Hoberg Jobs verifies legitimate employers. Never share financial
              details or pay any fees for job applications.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
