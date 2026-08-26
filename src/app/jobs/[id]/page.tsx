import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { fetchJobById } from '@/utils/jobs'
import {
  MapPin,
  Briefcase,
  Calendar,
  Building2,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  Clock,
  CheckCircle,
} from '@/components/icons'

export default async function JobDetails({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const job = await fetchJobById(id)

  if (!job) {
    notFound()
  }

  // Check auth & profile review status
  let user = null
  let reviewStatus: 'draft' | 'under_review' | 'approved' | 'rejected' = 'draft'

  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('review_status')
        .eq('id', user.id)
        .single()

      if (profile?.review_status) {
        reviewStatus = profile.review_status
      }
    }
  } catch {
    user = null
  }

  // Check if description is HTML or plain text
  const isHtml =
    job.description.includes('<p>') ||
    job.description.includes('<div>') ||
    job.description.includes('<br>')

  return (
    <div className="flex-1 bg-[#f5f5f7] py-8 sm:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <Link
          href="/jobs"
          className="inline-flex items-center text-[14px] font-semibold text-[#e02424] hover:underline mb-6 sm:mb-8"
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
                {job.company_logo_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={job.company_logo_url}
                    alt={job.company_name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-contain bg-[#f5f5f7] border border-[#d2d2d7]/50 p-2 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#f5f5f7] rounded-2xl flex items-center justify-center shrink-0 border border-[#d2d2d7]/50">
                    <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-[#1d1d1f]" />
                  </div>
                )}
                <div>
                  <h1 className="text-[22px] sm:text-[30px] font-semibold text-[#1d1d1f] tracking-tight leading-snug mb-1">
                    {job.title}
                  </h1>
                  <p className="text-[15px] sm:text-[17px] text-[#86868b] font-medium">
                    {job.company_name}
                  </p>
                </div>
              </div>

              {/* Apply button desktop / mobile - Gated by Auth & Review Status */}
              <div className="shrink-0 flex flex-col items-stretch sm:items-end">
                {!user ? (
                  <>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold px-6 py-3 rounded-full transition-colors text-[15px] shadow-sm cursor-pointer"
                    >
                      Sign in with Google to Apply
                    </Link>
                    <p className="text-[12px] text-[#86868b] mt-2 text-center sm:text-right">
                      Account &amp; profile verification required
                    </p>
                  </>
                ) : reviewStatus === 'approved' ? (
                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold px-6 py-3 rounded-full transition-colors text-[15px] shadow-sm cursor-pointer"
                  >
                    Apply on Official Site
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                ) : reviewStatus === 'under_review' ? (
                  <Link
                    href="/profile"
                    className="inline-flex items-center justify-center bg-amber-50 border border-amber-300 text-amber-900 font-semibold px-5 py-2.5 rounded-full transition-colors text-[14px] shadow-sm"
                  >
                    <Clock className="w-4 h-4 mr-2 text-amber-700" />
                    <span>Profile Under Review</span>
                  </Link>
                ) : (
                  <Link
                    href="/profile"
                    className="inline-flex items-center justify-center bg-[#1d1d1f] hover:bg-black text-white font-semibold px-6 py-3 rounded-full transition-colors text-[14px] shadow-sm"
                  >
                    <span>Complete Profile to Apply</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-6 pt-6 border-t border-black/[0.04]">
              <span className="inline-flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-[#1d1d1f] bg-[#f5f5f7] px-3 py-1.5 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-[#86868b]" />
                {job.location}
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

          {/* Description */}
          <div className="p-6 sm:p-10 space-y-8">
            <div>
              <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#1d1d1f] mb-4">
                Job Overview &amp; Responsibilities
              </h2>
              {isHtml ? (
                <div
                  className="prose prose-neutral max-w-none text-[15px] sm:text-[16px] text-[#1d1d1f]/85 leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              ) : (
                <div className="text-[15px] sm:text-[16px] text-[#1d1d1f]/85 leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              )}
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
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#e02424] shadow-sm border border-[#d2d2d7]/40">
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

            {/* Bottom Gated Application Action Card */}
            <div className="bg-[#f5f5f7] border border-[#d2d2d7]/60 rounded-3xl p-6 sm:p-8 text-center">
              {!user ? (
                <>
                  <h3 className="text-[18px] font-bold text-[#1d1d1f] mb-2">
                    Sign in to apply for this role at {job.company_name}
                  </h3>
                  <p className="text-[14px] text-[#86868b] mb-6 max-w-md mx-auto">
                    Create a free account or sign in with Google to build your verified profile and unlock applications.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold px-8 py-3.5 rounded-full transition-colors text-[15px] shadow-sm cursor-pointer"
                  >
                    Sign in with Google
                  </Link>
                </>
              ) : reviewStatus === 'approved' ? (
                <>
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-[18px] font-bold text-[#1d1d1f] mb-1">
                    You are verified &amp; ready to apply!
                  </h3>
                  <p className="text-[14px] text-[#86868b] mb-6 max-w-md mx-auto">
                    Click below to open the official application portal for {job.company_name}.
                  </p>
                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold px-8 py-3.5 rounded-full transition-colors text-[15px] shadow-sm cursor-pointer"
                  >
                    Apply on Official Site
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </>
              ) : reviewStatus === 'under_review' ? (
                <>
                  <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-[18px] font-bold text-amber-950 mb-1">
                    Profile Under Review
                  </h3>
                  <p className="text-[14px] text-amber-900/90 mb-6 max-w-md mx-auto leading-relaxed">
                    Our team is currently reviewing your professional profile. Usually reviewed within 24 hours. Once verified, you will be able to apply to all remote positions immediately.
                  </p>
                  <Link
                    href="/profile"
                    className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-[#1d1d1f] font-semibold px-8 py-3 rounded-full border border-gray-300 transition-colors text-[14px] shadow-sm"
                  >
                    View Review Status
                  </Link>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-200 text-[#1d1d1f] rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-[18px] font-bold text-[#1d1d1f] mb-1">
                    Complete &amp; Submit Your Profile
                  </h3>
                  <p className="text-[14px] text-[#86868b] mb-6 max-w-md mx-auto leading-relaxed">
                    Before applying for opportunities, submit your verified career profile for Hoberg review.
                  </p>
                  <Link
                    href="/profile"
                    className="inline-flex items-center justify-center bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold px-8 py-3.5 rounded-full transition-colors text-[15px] shadow-sm"
                  >
                    Complete Profile &amp; Submit
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Footer Security Notice */}
          <div className="bg-[#fafafc] p-6 sm:p-8 border-t border-black/[0.04] flex items-start gap-3.5 text-[13px] text-[#86868b] leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-[#e02424] shrink-0 mt-0.5" />
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
