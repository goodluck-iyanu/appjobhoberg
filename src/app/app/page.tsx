import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { fetchLiveJobs } from '@/utils/jobs'
import { calculateProfileStrength } from '@/utils/matching'
import {
  Briefcase,
  CheckCircle,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  Crown,
  MapPin,
  Building2,
  Bookmark,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from '@/components/icons'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SeekerDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/app')
  }

  // 1. Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // If no profile yet or weak profile, prompt CV onboarding
  const strength = calculateProfileStrength(profile)

  // 2. Fetch applications from tracker
  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const apps = applications || []
  const appliedCount = apps.filter((a) => a.status === 'Applied' || a.status === 'submitted').length
  const interviewCount = apps.filter((a) => a.status === 'Interview').length
  const offerCount = apps.filter((a) => a.status === 'Offer').length
  const savedCount = apps.filter((a) => a.status === 'Saved').length

  const recommendedJobs = await fetchLiveJobs({
    limit: 10,
    userProfile: profile,
  })

  // 4. Fetch Credit Balances
  const { data: ledger } = await supabase
    .from('credit_ledger')
    .select('kind, delta')
    .eq('user_id', user.id)

  let tailorCredits = 0
  let rewriteCredits = 0
  if (ledger) {
    for (const row of ledger) {
      if (row.kind.startsWith('tailor')) tailorCredits += row.delta
      if (row.kind.startsWith('rewrite')) rewriteCredits += row.delta
    }
  }

  const displayName = profile?.full_name || profile?.display_name || user.email?.split('@')[0] || 'Candidate'
  const isPremium = Boolean(profile?.is_premium)

  return (
    <div className="flex-1 bg-[#f5f5f7] py-6 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        {/* ─── Top Welcome & This Week Summary ─── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  🇳🇬 Active Seeker
                </span>
                {isPremium ? (
                  <span className="inline-flex items-center gap-1 text-[12px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span>Hoberg Pro</span>
                  </span>
                ) : (
                  <span className="text-[12px] text-[#86868b]">Free Seeker Plan</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
                Welcome, {displayName}
              </h1>
              <p className="text-[13px] text-[#86868b] mt-1">
                {recommendedJobs.length} active roles tailored to your target skills in {profile?.city || 'Lagos'}.
              </p>
            </div>

            {/* Profile Strength Widget */}
            <Link
              href="/app/cv"
              className="bg-[#f5f5f7] hover:bg-gray-200/80 transition-colors rounded-2xl p-3.5 border border-black/[0.04] flex items-center gap-3.5 shrink-0"
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex flex-col items-center justify-center font-bold text-[#1d1d1f] text-[14px]">
                <span>{strength.score}%</span>
                <span className="text-[9px] text-[#86868b] -mt-0.5">SCORE</span>
              </div>
              <div>
                <p className="text-[11px] text-[#86868b] font-medium uppercase tracking-wider">Master CV</p>
                <p className="text-[13px] font-semibold text-[#1d1d1f] flex items-center gap-1">
                  <span>{strength.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </p>
              </div>
            </Link>
          </div>

          {/* This Week Activity Counter Bar */}
          <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/app/tracker"
              className="p-3.5 rounded-2xl bg-[#f5f5f7] hover:bg-gray-100 transition-colors border border-black/[0.02]"
            >
              <p className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider">Applied</p>
              <p className="text-2xl font-bold text-[#1d1d1f] mt-0.5">{appliedCount}</p>
              <p className="text-[11px] text-emerald-700 font-medium mt-1">Free & Unlimited</p>
            </Link>

            <Link
              href="/app/tracker"
              className="p-3.5 rounded-2xl bg-[#f5f5f7] hover:bg-gray-100 transition-colors border border-black/[0.02]"
            >
              <p className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider">Interviews</p>
              <p className="text-2xl font-bold text-blue-600 mt-0.5">{interviewCount}</p>
              <p className="text-[11px] text-[#86868b] mt-1">In Pipeline</p>
            </Link>

            <Link
              href="/app/tracker"
              className="p-3.5 rounded-2xl bg-[#f5f5f7] hover:bg-gray-100 transition-colors border border-black/[0.02]"
            >
              <p className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider">Offers</p>
              <p className="text-2xl font-bold text-emerald-600 mt-0.5">{offerCount}</p>
              <p className="text-[11px] text-[#86868b] mt-1">Received</p>
            </Link>

            <Link
              href="/app/tracker"
              className="p-3.5 rounded-2xl bg-[#f5f5f7] hover:bg-gray-100 transition-colors border border-black/[0.02]"
            >
              <p className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider">Saved Jobs</p>
              <p className="text-2xl font-bold text-purple-600 mt-0.5">{savedCount}</p>
              <p className="text-[11px] text-[#86868b] mt-1">To Apply</p>
            </Link>
          </div>
        </div>

        {/* ─── Profile Improvement Checklist (If score < 80) ─── */}
        {strength.score < 80 && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.06] shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[14px] font-bold text-[#1d1d1f] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Next steps to unlock higher match scores:</span>
              </span>
              <Link href="/app/cv" className="text-[12px] font-semibold text-[#e02424] hover:underline">
                Edit CV →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {strength.nextActions.map((action) => (
                <Link
                  key={action.id}
                  href={action.href}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f5f5f7] hover:bg-red-50/50 text-[13px] text-[#1d1d1f] font-medium transition-colors border border-transparent hover:border-red-200"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-[#86868b] shrink-0" />
                  <span className="line-clamp-1">{action.text}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ─── AI CV Tools Upsell / Credit Status ─── */}
        {!isPremium && tailorCredits <= 0 && rewriteCredits <= 0 ? (
          <div className="bg-gradient-to-r from-amber-500/10 via-[#e02424]/5 to-transparent rounded-3xl p-5 sm:p-6 border border-amber-500/20 shadow-xs mb-8">
            <div className="flex items-start gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm shrink-0 border border-amber-200">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-[16px] sm:text-[18px] font-bold text-[#1d1d1f]">
                  Get your CV updated for a high chance of getting a job 🚀
                </h2>
                <p className="text-[13px] text-[#86868b] mt-1 mb-3">
                  Employers use ATS software to filter out CVs without the right keywords. Let our AI tailor your CV to pass the bots.
                </p>

                <div className="flex flex-wrap gap-2.5">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1.5 bg-white border border-amber-300 hover:border-amber-400 text-amber-800 font-semibold px-3 py-1.5 rounded-lg text-[13px] transition-colors shadow-sm"
                  >
                    Tailor CV for a Job — ₦700
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1.5 bg-white border border-red-200 hover:border-red-300 text-red-700 font-semibold px-3 py-1.5 rounded-lg text-[13px] transition-colors shadow-sm"
                  >
                    Full CV Rewrite — ₦2,000
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 text-[#1d1d1f] font-semibold px-3 py-1.5 rounded-lg text-[13px] transition-colors shadow-sm"
                  >
                    View All AI Tools &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 rounded-2xl p-4 sm:p-5 border border-emerald-200 mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-full shadow-sm shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-emerald-900">
                  You have active CV credits
                </h3>
                <p className="text-[12px] text-emerald-700">
                  {isPremium ? 'Your Hoberg Pro monthly quotas are active.' : `You have ${tailorCredits} tailored CVs left.`} Use them on any job detail page or in your Master CV.
                </p>
              </div>
            </div>
            <Link 
              href="/app/cv"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-[12px] font-semibold rounded-xl transition-colors shrink-0"
            >
              Go to Master CV
            </Link>
          </div>
        )}

        {/* ─── Recommended Jobs Feed (High Match Scores) ─── */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1d1d1f] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#e02424]" />
                <span>Recommended For You</span>
              </h2>
              <p className="text-[12px] text-[#86868b]">
                Ranked by truthful match with your master profile
              </p>
            </div>

            <Link
              href="/jobs"
              className="text-[13px] font-semibold text-[#e02424] hover:underline flex items-center gap-1"
            >
              <span>Explore all jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {recommendedJobs.map((job) => {
              const isLowHireChance = job.hires_from_nigeria === 'no'
              const isDollar = job.salary_range?.includes('$') || job.salary_currency === 'USD'

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-5 border border-black/[0.06] hover:border-black/[0.15] hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-[11px] font-medium bg-[#f5f5f7] text-[#1d1d1f] px-2.5 py-0.5 rounded-full border border-black/[0.04] flex items-center gap-1">
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

                      {/* Match Badge */}
                      <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full ${
                        (job.match_score || 50) >= 70
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {job.match_score || 50}% match
                      </span>
                    </div>

                    {/* Title */}
                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-[16px] font-bold text-[#1d1d1f] hover:text-[#e02424] transition-colors"
                    >
                      {job.title}
                    </Link>

                    {/* Company */}
                    <p className="text-[13px] font-medium text-[#86868b] mt-0.5 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{job.company_name}</span>
                    </p>

                    {/* Reason */}
                    {job.match_reason && (
                      <p className="text-[12px] text-emerald-700 font-medium mt-2">
                        ✓ {job.match_reason}
                      </p>
                    )}

                    {/* Missing Keywords */}
                    {job.missing_keywords && job.missing_keywords.length > 0 && (
                      <p className="text-[11px] text-[#86868b] mt-0.5">
                        Missing from profile: <span className="text-amber-700 font-medium">{job.missing_keywords.join(', ')}</span>
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <span className="text-[13px] font-semibold text-[#1d1d1f]">
                      {job.salary_range && job.salary_range !== 'Competitive' ? job.salary_range : 'Competitive'}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/app/cv?tailorFor=${job.id}`}
                        className="text-[12px] font-semibold text-[#86868b] hover:text-[#1d1d1f] bg-[#f5f5f7] px-3 py-1.5 rounded-full border border-gray-200"
                      >
                        Tailor CV
                      </Link>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-[12px] font-semibold text-white bg-[#e02424] hover:bg-[#c81e1e] px-4 py-1.5 rounded-full shadow-xs"
                      >
                        View &amp; Apply
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ─── Soft Pro Banner (Never blocking) ─── */}
        {!isPremium && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-bold text-[15px] text-amber-950">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>Upgrade to Hoberg Pro (₦2,500/month)</span>
              </div>
              <p className="text-[13px] text-amber-900 mt-1 max-w-xl leading-relaxed">
                Get 8 AI-tailored CVs per month, 2 full professional rewrites, instant WhatsApp/email alerts, and deep match keyword breakdown. Apply always stays 100% free.
              </p>
            </div>

            <Link
              href="/pricing"
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[13px] px-6 py-2.5 rounded-full shadow-xs transition-all"
            >
              See Pro Plan →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

