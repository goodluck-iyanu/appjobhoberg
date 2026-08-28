import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import {
  Crown,
  Briefcase,
  Bookmark,
  FileText,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  ExternalLink,
  Sparkles,
  Lock,
} from '@/components/icons'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; reference?: string }>
}) {
  const { upgraded, reference } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // If returning from Paystack with a reference, ensure profile is updated securely
  if (upgraded === 'true' && reference) {
    try {
      const paystackSecret = process.env.PAYSTACK_SECRET_KEY
      let paymentVerified = false

      if (paystackSecret && paystackSecret.startsWith('sk_')) {
        // Verify securely with Paystack API
        const verifyRes = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
          {
            headers: { Authorization: `Bearer ${paystackSecret}` },
            cache: 'no-store',
          }
        )
        const verifyData = await verifyRes.json()
        if (verifyData.status && verifyData.data?.status === 'success') {
          paymentVerified = true
        }
      } else {
        // Test mode/simulated
        paymentVerified = true
      }

      if (paymentVerified) {
        await supabase
          .from('profiles')
          .update({
            is_premium: true,
            premium_tier: 'founding_member',
            premium_since: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        // Record in payments table (silently fails if reference already exists due to unique constraint)
        await supabase.from('payments').insert({
          user_id: user.id,
          reference: reference,
          amount: 4000,
          currency: 'NGN',
          status: 'success',
          plan_tier: 'founding_member',
        })
      }
    } catch {
      // Ignore if update fails or duplicate
    }
  }

  // Fetch current user profile
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    const { data: newProf } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        review_status: 'draft',
        created_at: new Date().toISOString(),
      })
      .select('*')
      .maybeSingle()
    profile = newProf
  }

  // Fetch all user applications
  let { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const displayName =
    profile?.full_name ||
    profile?.display_name ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'Job Seeker'

  const isPremium = profile?.is_premium || upgraded === 'true'
  const reviewStatus: 'draft' | 'under_review' | 'approved' | 'rejected' = profile?.review_status || 'draft'

  // Calculate monthly application usage
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const monthlyApps = (applications || []).filter((app: any) => {
    return new Date(app.created_at) >= startOfMonth
  })
  const monthlyCount = monthlyApps.length
  const freeLimit = 3
  const remainingApps = isPremium ? 'Unlimited' : Math.max(0, freeLimit - monthlyCount)
  const isLimitReached = !isPremium && monthlyCount >= freeLimit

  return (
    <div className="flex-1 bg-[#f5f5f7] py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Upgraded celebration banner */}
        {upgraded === 'true' && (
          <div className="mb-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-5 rounded-2xl shadow-lg flex items-center justify-between gap-4 animate-bounce">
            <div className="flex items-center gap-3">
              <Crown className="w-7 h-7 text-amber-200 shrink-0" />
              <div>
                <h3 className="font-bold text-[16px]">🎉 Welcome to Hoberg Premium!</h3>
                <p className="text-[13px] text-white/90">Your account has been upgraded to Founding Member status with Unlimited Applications.</p>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Header */}
        <div className="bg-white border border-[#d2d2d7]/70 rounded-3xl p-6 sm:p-10 mb-8 shadow-sm relative overflow-hidden">
          {isPremium && (
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-500 text-black text-[11px] font-black uppercase tracking-widest px-5 py-1.5 rounded-bl-2xl shadow-sm flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              PRO FOUNDING MEMBER
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {isPremium ? (
                  <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 text-[12px] font-bold px-3 py-1 rounded-full">
                    <Crown className="w-3.5 h-3.5 text-amber-700" />
                    Pro Founding Member &bull; Unlimited Applications
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-[12px] font-medium px-3 py-1 rounded-full">
                    Free Tier &bull; 3 Monthly Applications
                  </span>
                )}

                {reviewStatus === 'approved' ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[12px] font-bold px-3 py-1 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Candidate
                  </span>
                ) : reviewStatus === 'under_review' ? (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[12px] font-bold px-3 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Profile Under Review
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-red-100 text-[#e02424] text-[12px] font-bold px-3 py-1 rounded-full">
                    Profile Verification Needed
                  </span>
                )}
              </div>

              <h1 className="text-[26px] sm:text-[32px] font-bold text-[#1d1d1f] tracking-tight">
                Welcome back, {displayName}
              </h1>
              <p className="text-[15px] text-[#86868b] mt-1">
                Manage your verified career profile and track all submitted job applications.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="bg-[#1d1d1f] hover:bg-black text-white font-semibold text-[14px] px-5 py-2.5 rounded-full transition-colors shrink-0 shadow-sm"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Monthly Application Allowance Card */}
        <div className="bg-white border border-[#d2d2d7]/70 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#86868b]">
                Monthly Application Limit
              </span>
              <h3 className="text-[18px] sm:text-[20px] font-bold text-[#1d1d1f]">
                {isPremium ? (
                  <span className="text-amber-600 flex items-center gap-1.5">
                    <Crown className="w-5 h-5" /> Unlimited Applications Active
                  </span>
                ) : (
                  <span>
                    {monthlyCount} of 3 free applications used this month
                  </span>
                )}
              </h3>
            </div>

            {!isPremium && (
              <Link
                href="/premium"
                className={`inline-flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 rounded-full transition-all shadow-sm ${
                  isLimitReached
                    ? 'bg-gradient-to-r from-amber-500 to-[#e02424] text-white hover:opacity-95'
                    : 'bg-red-50 text-[#e02424] hover:bg-red-100 border border-red-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isLimitReached ? 'Upgrade for Unlimited' : 'Get Unlimited for ₦4,000'}</span>
              </Link>
            )}
          </div>

          {/* Progress Bar for Free users */}
          {!isPremium && (
            <div>
              <div className="w-full bg-[#f5f5f7] h-3 rounded-full overflow-hidden mb-2 border border-gray-100">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isLimitReached ? 'bg-[#e02424]' : monthlyCount >= 2 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (monthlyCount / 3) * 100)}%` }}
                />
              </div>
              <p className="text-[12px] text-[#86868b]">
                {isLimitReached
                  ? '⚠️ You have used your 3 free applications for this month. Upgrade to Premium to unlock more.'
                  : `${remainingApps} free application(s) remaining for this calendar month.`}
              </p>
            </div>
          )}
        </div>

        {/* Verification Status Card */}
        {reviewStatus === 'under_review' ? (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-7 mb-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-800 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[11px] font-bold uppercase tracking-wider mb-1">
                  🟡 Under Review
                </div>
                <h3 className="font-bold text-[16px] text-amber-950">
                  Profile is currently being reviewed by Hoberg
                </h3>
                <p className="text-[13px] text-amber-800/90 mt-0.5 leading-relaxed">
                  Expected review turnaround: <strong className="text-amber-950">within 24 hours</strong>. We will notify you once approved.
                </p>
              </div>
            </div>
            <Link
              href="/profile"
              className="bg-white hover:bg-amber-100/60 text-amber-900 font-semibold text-[13px] px-5 py-2.5 rounded-full border border-amber-300 transition-colors shrink-0 shadow-sm"
            >
              Check Status
            </Link>
          </div>
        ) : reviewStatus === 'approved' ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-7 mb-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-800 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[11px] font-bold uppercase tracking-wider mb-1">
                  🟢 Verified &amp; Approved
                </div>
                <h3 className="font-bold text-[16px] text-emerald-950">
                  You are approved to apply for remote opportunities
                </h3>
                <p className="text-[13px] text-emerald-800/90 mt-0.5 leading-relaxed">
                  Your profile has been verified. You have full 1-click external application access across all listings.
                </p>
              </div>
            </div>
            <Link
              href="/jobs"
              className="bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold text-[13px] px-5 py-2.5 rounded-full transition-colors shrink-0 shadow-sm"
            >
              Browse Remote Jobs
            </Link>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-[#e02424]/40 rounded-3xl p-6 sm:p-7 mb-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-gradient-to-r from-red-50/40 to-transparent">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-red-100 rounded-2xl flex items-center justify-center text-[#e02424] shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-[#e02424] text-[11px] font-bold uppercase tracking-wider mb-1">
                  ⚠️ Action Required
                </div>
                <h3 className="font-bold text-[16px] text-[#1d1d1f]">
                  Complete &amp; Submit Your Profile for Hoberg Review
                </h3>
                <p className="text-[13px] text-[#86868b] mt-0.5 leading-relaxed">
                  Before applying for any job, your career profile must be submitted and approved by our team.
                </p>
              </div>
            </div>
            <Link
              href="/profile"
              className="bg-[#e02424] hover:bg-[#c81e1e] text-white font-bold text-[13px] px-6 py-3 rounded-full transition-colors shrink-0 shadow-sm"
            >
              Complete Profile &rarr;
            </Link>
          </div>
        )}

        {/* Application History */}
        <div className="bg-white border border-[#d2d2d7]/70 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[18px] font-bold text-[#1d1d1f]">Submitted Applications</h2>
              <p className="text-[13px] text-[#86868b]">All opportunities you have applied to via Hoberg Jobs</p>
            </div>
            <Link
              href="/jobs"
              className="text-[13px] font-semibold text-[#e02424] hover:underline inline-flex items-center gap-1"
            >
              <span>Explore more jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {applications && applications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {applications.map((app: any) => (
                <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-[15px] text-[#1d1d1f]">{app.job_title}</h4>
                    <p className="text-[13px] text-[#86868b]">{app.company_name} &bull; Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                  {(app.apply_url || app.notes) && (
                    <a
                      href={app.apply_url || app.notes}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[13px] text-[#e02424] hover:underline font-semibold shrink-0"
                    >
                      <span>Revisit Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-[#86868b]">
              <p className="text-[14px]">You haven&apos;t submitted any applications yet.</p>
              <Link href="/jobs" className="text-[13px] font-bold text-[#e02424] hover:underline mt-2 inline-block">
                Start browsing remote jobs &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Explore Latest Jobs CTA */}
        <div className="bg-gradient-to-r from-[#e02424] to-[#b91c1c] rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h2 className="text-[20px] sm:text-[24px] font-bold mb-1">Ready to explore new roles?</h2>
            <p className="text-white/80 text-[14px]">Browse hundreds of verified remote opportunities across all fields.</p>
          </div>
          <Link
            href="/jobs"
            className="bg-white text-[#e02424] font-semibold text-[15px] px-6 py-3 rounded-full hover:bg-white/90 transition-colors shrink-0 shadow-sm"
          >
            Browse Remote Jobs
          </Link>
        </div>
      </div>
    </div>
  )
}
