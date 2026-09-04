import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import MobileMenu from '@/components/MobileMenu'
import SignOutButton from '@/components/SignOutButton'
import { Crown, Sparkles, PlusCircle } from '@/components/icons'

export default async function Navbar() {
  let user = null
  let isPremium = false
  let profileName = ''

  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium, full_name, display_name')
        .eq('id', user.id)
        .maybeSingle()
      isPremium = !!profile?.is_premium
      profileName = profile?.full_name || profile?.display_name || user.email?.split('@')[0] || 'My Account'
    }
  } catch {
    user = null
  }

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-black/[0.04]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo with Nigerian Flag Tag */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center group">
            <span className="font-bold text-[20px] tracking-tight">
              <span className="text-[#e02424]">Hoberg</span>
              <span className="text-[#1d1d1f] ml-1">Jobs</span>
            </span>
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full">
            <span>🇳🇬</span>
            <span>Nigeria First</span>
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/jobs"
            className="text-[13px] font-medium text-[#1d1d1f]/80 hover:text-[#1d1d1f] transition-colors"
          >
            Find Jobs
          </Link>
          <Link
            href="/jobs/lagos"
            className="text-[13px] font-medium text-[#1d1d1f]/80 hover:text-[#1d1d1f] transition-colors"
          >
            Lagos Jobs
          </Link>
          <Link
            href="/jobs/remote-nigeria"
            className="text-[13px] font-medium text-[#1d1d1f]/80 hover:text-[#1d1d1f] transition-colors"
          >
            Remote NG
          </Link>
          <Link
            href="/pricing"
            className="text-[13px] font-medium text-[#1d1d1f]/80 hover:text-[#1d1d1f] transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Pricing</span>
          </Link>
          <Link
            href="/employers"
            className="text-[13px] font-medium text-[#1d1d1f]/80 hover:text-[#1d1d1f] transition-colors flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#e02424]" />
            <span>Post a Job</span>
          </Link>
        </nav>

        {/* Right side: auth status + mobile menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] px-3.5 py-1.5 rounded-full border border-[#d2d2d7]/60 transition-colors"
              >
                {isPremium && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                <span>Dashboard</span>
              </Link>
              <Link
                href="/app/tracker"
                className="text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f] transition-colors"
              >
                Tracker
              </Link>
              <Link
                href="/app/cv"
                className="text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f] transition-colors"
              >
                My CV
              </Link>
              <SignOutButton />
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-[13px] font-medium text-[#1d1d1f] hover:opacity-80 transition-opacity"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center text-[13px] font-semibold text-white bg-[#e02424] hover:bg-[#c81e1e] active:scale-[0.98] px-4 py-1.5 rounded-full transition-all shadow-sm"
              >
                Get Started Free
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu */}
          <MobileMenu user={user} isPremium={isPremium} profileName={profileName} />
        </div>
      </div>
    </header>
  )
}
