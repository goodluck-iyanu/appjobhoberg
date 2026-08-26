import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
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

export default async function JobDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Fetch the specific job
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !job) {
    notFound()
  }

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  const postedDate = new Date(job.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="max-w-[720px] mx-auto px-5 sm:px-6 py-10 sm:py-14">

        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#0066cc] hover:text-[#0077ed] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Jobs
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_1px_12px_rgba(0,0,0,0.06)] border border-[#d2d2d7]/30 overflow-hidden">

          {/* ── Header ── */}
          <div className="px-6 pt-8 pb-7 sm:px-10 sm:pt-10 sm:pb-8 border-b border-[#d2d2d7]/30">

            {/* Logo + Title */}
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] bg-[#f5f5f7] rounded-2xl flex items-center justify-center shrink-0 border border-[#d2d2d7]/50">
                <Building2 className="w-8 h-8 sm:w-9 sm:h-9 text-[#86868b]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[24px] sm:text-[28px] font-semibold text-[#1d1d1f] tracking-[-0.02em] leading-tight">
                  {job.title}
                </h1>
                <p className="text-[16px] sm:text-[17px] text-[#86868b] mt-1">
                  {job.company_name}
                </p>
              </div>
            </div>

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mt-6">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1d1d1f] bg-[#f5f5f7] px-3 py-1.5 rounded-full">
                <MapPin className="w-3.5 h-3.5 text-[#86868b]" />
                {job.is_remote ? 'Remote' : job.location}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1d1d1f] bg-[#f5f5f7] px-3 py-1.5 rounded-full">
                <Briefcase className="w-3.5 h-3.5 text-[#86868b]" />
                {job.employment_type}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1d1d1f] bg-[#f5f5f7] px-3 py-1.5 rounded-full">
                <Calendar className="w-3.5 h-3.5 text-[#86868b]" />
                {postedDate}
              </span>
              {job.salary_range && (
                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                  <DollarSign className="w-3.5 h-3.5" />
                  {job.salary_range}
                </span>
              )}
            </div>
          </div>

          {/* ── Apply Section ── */}
          <div className="px-6 py-6 sm:px-10 sm:py-7 border-b border-[#d2d2d7]/30 bg-[#fafafa]">
            {user ? (
              <a
                href={job.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full sm:w-auto bg-[#0066cc] hover:bg-[#0077ed] active:bg-[#004499] text-white font-medium px-8 py-3 rounded-full transition-colors text-[15px] sm:text-[16px]"
              >
                Apply Now
                <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
              </a>
            ) : (
              <div>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full sm:w-auto bg-[#0066cc] hover:bg-[#0077ed] active:bg-[#004499] text-white font-medium px-8 py-3 rounded-full transition-colors text-[15px] sm:text-[16px]"
                >
                  Sign in to Apply
                </Link>
                <p className="text-[13px] text-[#86868b] mt-2.5">
                  Create a free account or sign in to apply for this position.
                </p>
              </div>
            )}
          </div>

          {/* ── Body Content ── */}
          <div className="px-6 py-8 sm:px-10 sm:py-10 space-y-10">

            {/* About this role */}
            <section>
              <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#1d1d1f] mb-4">
                About this role
              </h2>
              <div className="text-[15px] sm:text-[16px] text-[#1d1d1f]/75 leading-[1.7] whitespace-pre-wrap">
                {job.description}
              </div>
            </section>

            {/* Requirements */}
            {job.requirements && (
              <section>
                <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#1d1d1f] mb-4">
                  Requirements
                </h2>
                <div className="text-[15px] sm:text-[16px] text-[#1d1d1f]/75 leading-[1.7] whitespace-pre-wrap">
                  {job.requirements}
                </div>
              </section>
            )}

            {/* Salary Card */}
            {job.salary_range && (
              <section className="bg-[#f5f5f7] rounded-2xl p-6 flex items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-[#d2d2d7]/30">
                  <DollarSign className="w-5 h-5 text-[#1d1d1f]" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-0.5">
                    Estimated Salary
                  </p>
                  <p className="text-[20px] sm:text-[22px] font-semibold text-[#1d1d1f] tracking-tight">
                    {job.salary_range}
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* ── Footer Notice ── */}
          <div className="px-6 py-5 sm:px-10 sm:py-6 bg-[#fbfbfd] border-t border-[#d2d2d7]/30 flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-[#86868b] shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#86868b] leading-relaxed">
              Hoberg Jobs verifies all opportunities to the best of our ability. Never pay for
              an interview or share sensitive financial information during the application process.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
