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

  // If returning from Paystack with a reference, ensure profile is updated
  if (upgraded === 'true') {
    try {
      await supabase
        .from('profiles')
        .update({
          is_premium: true,
          premium_tier: 'founding_member',
          premium_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
    } catch {
      // Ignore if update fails or duplicate
    }
  }

  // Fetch current user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch user applications
  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)

  const displayName =
    profile?.display_name ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'User'

  const isPremium = profile?.is_premium || upgraded === 'true'

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
                <p className="text-[13px] text-white/90">Your account has been upgraded to Founding Member status.</p>
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
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-300 text-[12px] font-bold px-3 py-1 rounded-full">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    Premium Member
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-gray-100 text-[#1d1d1f] text-[12px] font-semibold px-3 py-1 rounded-full">
                    Free Account
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <h1 className="text-[26px] sm:text-[34px] font-bold text-[#1d1d1f] tracking-tight">
                Welcome, {displayName}!
              </h1>
              <p className="text-[14px] sm:text-[15px] text-[#86868b] mt-1">
                {user.email} &bull; {profile?.career_field || 'Remote Professional'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="bg-[#1d1d1f] hover:bg-[#2d2d30] text-white text-[14px] font-medium px-5 py-2.5 rounded-full transition-colors"
              >
                Edit Profile
              </Link>
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-[14px] font-medium px-4 py-2.5 rounded-full border border-[#d2d2d7]/60 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Premium Upgrade Banner if not premium */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-[#1d1d1f] to-[#2e2e33] text-white p-6 sm:p-8 rounded-3xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-400/20 rounded-2xl flex items-center justify-center shrink-0 border border-amber-400/30 text-amber-300">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-[18px] text-white">Upgrade to Founding Member (20% OFF)</h3>
                <p className="text-[14px] text-white/70 mt-0.5">Unlock curated premium remote opportunities and direct recruiter tips with Paystack.</p>
              </div>
            </div>
            <Link
              href="/premium"
              className="bg-[#e02424] hover:bg-[#c81e1e] text-white font-semibold text-[14px] px-6 py-3 rounded-full transition-colors shrink-0 shadow-sm"
            >
              Upgrade for ₦4,000
            </Link>
          </div>
        )}

        {/* Profile Stats / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white border border-[#d2d2d7]/70 rounded-2xl p-6 shadow-sm">
            <div className="w-10 h-10 bg-red-50 text-[#e02424] rounded-xl flex items-center justify-center mb-4">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-1">Career Profile</h3>
            <p className="text-[13px] text-[#86868b] mb-4">
              {profile?.career_field ? `Field: ${profile.career_field}` : 'Add your career field and skills for smart matching.'}
            </p>
            <Link href="/profile" className="text-[13px] font-semibold text-[#e02424] hover:underline inline-flex items-center">
              Update details <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="bg-white border border-[#d2d2d7]/70 rounded-2xl p-6 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <Bookmark className="w-5 h-5" />
            </div>
            <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-1">Saved Roles</h3>
            <p className="text-[13px] text-[#86868b] mb-4">
              Bookmark interesting opportunities while browsing to review later.
            </p>
            <Link href="/jobs" className="text-[13px] font-semibold text-[#e02424] hover:underline inline-flex items-center">
              Find more jobs <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="bg-white border border-[#d2d2d7]/70 rounded-2xl p-6 shadow-sm">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-1">Applications</h3>
            <p className="text-[13px] text-[#86868b] mb-4">
              {applications && applications.length > 0 ? `${applications.length} active application(s)` : 'Track all roles you have applied for in one place.'}
            </p>
            <Link href="/jobs" className="text-[13px] font-semibold text-[#e02424] hover:underline inline-flex items-center">
              Explore openings <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>

        {/* Curated Opportunities for Premium Users */}
        {isPremium && (
          <div className="bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-[#1d1d1f]">Curated Premium Opportunities</h2>
                  <p className="text-[13px] text-[#86868b]">Exclusive high-compensation remote positions selected by Hoberg</p>
                </div>
              </div>
              <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                PRO Feed
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: 'Executive Remote Operations Lead ($90,000 - $120,000/yr)',
                  company: 'Global Talent Partners',
                  loc: 'Worldwide / Africa Eligible',
                  tips: 'Application tip: Highlight process automation and cross-functional leadership in your intro.',
                },
                {
                  title: 'Senior Fintech Product Manager ($110,000 - $145,000/yr)',
                  company: 'Apex Horizon Payments',
                  loc: 'Remote (US / UK / Nigeria)',
                  tips: 'Application tip: Emphasize API payment integrations and compliance track record.',
                }
              ].map((pJob, idx) => (
                <div key={idx} className="bg-[#fafafc] border border-gray-200/70 p-4 sm:p-5 rounded-2xl hover:border-amber-400 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-[16px] text-[#1d1d1f]">{pJob.title}</h4>
                      <p className="text-[13px] text-[#86868b] mt-0.5">{pJob.company} &bull; {pJob.loc}</p>
                      <p className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-lg mt-3 inline-block">
                        💡 {pJob.tips}
                      </p>
                    </div>
                    <Link
                      href="/jobs"
                      className="bg-[#e02424] text-white text-[13px] font-semibold px-4 py-2 rounded-full hover:bg-[#c81e1e] transition-colors shrink-0 cursor-pointer"
                    >
                      Apply
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
