import Link from 'next/link'
import { fetchLiveJobs } from '@/utils/jobs'
import { createClient } from '@/utils/supabase/server'
import { calculateProfileStrength } from '@/utils/matching'
import {
  Search,
  MapPin,
  ArrowRight,
  Crown,
  Briefcase,
  CheckCircle,
  FileText,
  Clock,
  Sparkles
} from '@/components/icons'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  let apps: any[] = []
  let ledger: any[] = []

  if (user) {
    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
    profile = p

    const { data: a } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    apps = a || []

    const { data: l } = await supabase
      .from('credit_ledger')
      .select('kind, delta')
      .eq('user_id', user.id)
    ledger = l || []
  }

  const jobs = await fetchLiveJobs({
    limit: 12,
    userProfile: profile,
  })

  const quickFilterPills = [
    { label: '🇳🇬 All Nigeria', href: '/jobs' },
    { label: '📍 Lagos', href: '/jobs/lagos' },
    { label: '🏛️ Abuja', href: '/jobs/abuja' },
    { label: '🌐 Remote (Nigeria)', href: '/jobs/remote-nigeria' },
    { label: '💵 Dollar Remote', href: '/jobs/remote-dollar' },
    { label: '🎓 Graduate / NYSC', href: '/jobs/nysc' },
    { label: '💻 Tech', href: '/jobs/software-developer-nigeria' },
    { label: '🎧 Customer Support', href: '/jobs/customer-service' },
  ]

  const isPremium = Boolean(profile?.is_premium)
  let tailorCredits = 0
  let rewriteCredits = 0
  for (const row of ledger) {
    if (row.kind.startsWith('tailor')) tailorCredits += row.delta
    if (row.kind.startsWith('rewrite')) rewriteCredits += row.delta
  }

  const appliedCount = apps.filter((a) => a.status === 'Applied' || a.status === 'submitted').length
  const interviewCount = apps.filter((a) => a.status === 'Interview').length
  const offerCount = apps.filter((a) => a.status === 'Offer').length
  const savedCount = apps.filter((a) => a.status === 'Saved').length

  const strength = calculateProfileStrength(profile)

  return (
    <div className="flex-1 bg-white flex flex-col min-h-screen">
      
      {!user && (
        <section className="pt-12 pb-10 sm:pt-20 sm:pb-16 px-4 text-center bg-gradient-to-b from-white via-[#fafafc] to-[#f5f5f7]">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1d1d1f] leading-[1.12]">
              Find remote jobs that hire from Nigeria.
            </h1>
            <p className="mt-5 text-[16px] sm:text-[19px] text-[#86868b] max-w-2xl mx-auto leading-relaxed">
              Browse free. Apply free. Upload your CV once.
            </p>
            
            <div className="mt-8 max-w-2xl mx-auto">
              <form action="/jobs" method="GET" className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-full border-2 border-[#d2d2d7] shadow-sm hover:border-[#1d1d1f] focus-within:border-[#1d1d1f] transition-all">
                <div className="flex items-center gap-2.5 px-3 w-full sm:w-auto flex-1">
                  <Search className="w-5 h-5 text-[#86868b] shrink-0" />
                  <input type="text" name="q" placeholder="Job title, skill..." className="w-full bg-transparent text-[14px] sm:text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none" />
                </div>
                <button type="submit" className="w-full sm:w-auto bg-[#e02424] hover:bg-[#c81e1e] active:scale-[0.98] text-white font-semibold text-[14px] px-7 py-3 rounded-xl sm:rounded-full transition-all shrink-0 cursor-pointer shadow-sm">
                  Find Jobs
                </button>
              </form>
            </div>
            
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
              {quickFilterPills.map((pill) => (
                <Link key={pill.href} href={pill.href} className="text-[12px] sm:text-[13px] font-medium text-[#1d1d1f] bg-white hover:bg-gray-50 px-3.5 py-1.5 rounded-full border border-[#d2d2d7] transition-colors shadow-2xs">
                  {pill.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {user && (
        <section className="pt-8 pb-6 px-4 bg-[#f5f5f7]">
          <div className="max-w-5xl mx-auto space-y-6">
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight">
                    Welcome back, {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/app/cv" className="flex items-center justify-center gap-2 bg-[#1d1d1f] hover:bg-black text-white font-semibold text-[13px] px-6 py-3 rounded-full transition-colors shadow-sm">
                    <FileText className="w-4 h-4" />
                    <span>My Master CV</span>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 border-t border-gray-100 pt-6">
                <Link href="/app/tracker" className="p-3.5 rounded-2xl bg-[#f5f5f7] hover:bg-gray-200 transition-colors cursor-pointer group">
                  <p className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider group-hover:text-gray-900 transition-colors">Saved</p>
                  <p className="text-2xl font-bold text-[#1d1d1f] mt-1">{savedCount}</p>
                </Link>
                <Link href="/app/tracker" className="p-3.5 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer group">
                  <p className="text-[11px] text-blue-700 font-semibold uppercase tracking-wider group-hover:text-blue-900 transition-colors">Applied</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{appliedCount}</p>
                </Link>
                <Link href="/app/tracker" className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer group">
                  <p className="text-[11px] text-amber-700 font-semibold uppercase tracking-wider group-hover:text-amber-900 transition-colors">Interviews</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{interviewCount}</p>
                </Link>
                <Link href="/app/tracker" className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer group">
                  <p className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider group-hover:text-emerald-900 transition-colors">Offers</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{offerCount}</p>
                </Link>
              </div>
            </div>

            {(isPremium || tailorCredits > 0 || rewriteCredits > 0) && (
              <div className="bg-emerald-50 rounded-2xl p-4 sm:p-5 border border-emerald-200 mb-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-1.5 rounded-full shadow-sm shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-emerald-900">You have active CV credits</h3>
                    <p className="text-[12px] text-emerald-700">
                      {isPremium ? 'Your Hoberg Pro monthly quotas are active.' : `You have ${tailorCredits} tailored CVs left.`} Use them on any job detail page or in your Master CV.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {strength.score < 80 && (
              <div className="bg-white rounded-3xl p-5 border border-black/[0.06] shadow-xs flex justify-between items-center">
                <span className="text-[14px] font-bold text-[#1d1d1f] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Next steps to unlock higher match scores</span>
                </span>
                <Link href="/app/cv" className="text-[12px] font-semibold text-[#e02424] hover:underline">
                  Edit CV →
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="flex-1 py-12 sm:py-16 bg-[#f5f5f7] px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1d1d1f]">
                  {user ? 'Jobs For Your CV' : 'All Jobs'}
                </h2>
              </div>
            </div>
            {user && (
              <Link href="/jobs" className="text-[13px] font-semibold text-[#e02424] hover:underline flex items-center gap-1">
                <span>Explore all jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="space-y-3.5">
            {jobs.map((job) => {
              const isDollar = job.salary_range?.includes('$') || job.salary_currency === 'USD'
              
              return (
                <div key={job.id} className="group bg-white rounded-2xl p-5 border border-black/[0.06] hover:border-black/[0.15] hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#f5f5f7] rounded-xl flex items-center justify-center shrink-0 border border-black/[0.04] overflow-hidden">
                      <Briefcase className="w-6 h-6 text-[#86868b]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[16px] sm:text-[18px] text-[#1d1d1f] truncate group-hover:text-[#0066cc] transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-[14px] text-[#86868b] truncate mt-0.5">{job.company_name}</p>
                      
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#f5f5f7] text-[#1d1d1f] px-2 py-0.5 rounded-lg border border-black/[0.04]">
                          <MapPin className="w-3 h-3 text-[#e02424]" />
                          <span>{job.location || 'Remote'}</span>
                        </span>
                        {isDollar && (
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg">
                            💵 USD
                          </span>
                        )}
                        <span className="text-[11px] text-[#86868b] px-2 py-0.5 border border-black/[0.06] rounded-lg bg-white shadow-xs">
                          {job.source || 'Hoberg'}
                        </span>
                        {(job.match_score || 0) > 0 && user && (
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${(job.match_score || 0) >= 80 ? 'bg-emerald-100 text-emerald-800' : (job.match_score || 0) >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                            {job.match_score}% Match
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100 w-full sm:w-auto">
                    <Link href={`/jobs/${job.id}`} className="flex-1 sm:flex-none text-center bg-[#1d1d1f] hover:bg-black text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all">
                      View & Apply
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      
      <footer className="bg-white border-t border-black/[0.06] py-8 text-center text-[13px] text-[#86868b]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2024 Hoberg Jobs. Apply is free. Payments in naira through Paystack.</p>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:text-[#1d1d1f]">Pricing</Link>
            <Link href="/terms_of_service" className="hover:text-[#1d1d1f]">Terms</Link>
            <Link href="/privacy_policy" className="hover:text-[#1d1d1f]">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
