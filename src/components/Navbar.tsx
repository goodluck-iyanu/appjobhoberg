import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import MobileMenu from '@/components/MobileMenu'
import SignOutButton from '@/components/SignOutButton'
import { Crown } from '@/components/icons'

export default async function Navbar() {
  let user = null
  let isPremium = false

  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single()
      isPremium = !!profile?.is_premium
    }
  } catch {
    user = null
  }

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-black/[0.04]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <span className="font-bold text-[18px] tracking-tight">
            <span className="text-[#e02424]">Hoberg</span>
            <span className="text-[#1d1d1f] ml-1">Jobs</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          <Link
            href="/jobs"
            className="text-[13px] font-medium text-[#1d1d1f]/70 hover:text-[#1d1d1f]
                       transition-colors duration-200"
          >
            Find Jobs
          </Link>
          <Link
            href="/categories"
            className="text-[13px] font-medium text-[#1d1d1f]/70 hover:text-[#1d1d1f]
                       transition-colors duration-200"
          >
            Categories
          </Link>
          <Link
            href="/premium"
            className="text-[13px] font-medium text-[#1d1d1f]/70 hover:text-[#1d1d1f]
                       transition-colors duration-200 flex items-center gap-1"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Premium</span>
          </Link>
        </nav>

        {/* Right side: auth status + mobile menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] px-3.5 py-1.5 rounded-full border border-[#d2d2d7]/60 transition-colors"
              >
                {isPremium && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                <span>Dashboard</span>
              </Link>
              <SignOutButton />
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="inline-flex text-[13px] font-medium text-[#1d1d1f]/70
                           hover:text-[#1d1d1f] transition-colors duration-200"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex text-[13px] font-medium text-white
                           bg-[#e02424] hover:bg-[#c81e1e] px-4 py-1.5 rounded-full
                           transition-colors duration-200"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile Quick Sign up / Dashboard button */}
          {!user ? (
            <Link
              href="/signup"
              className="md:hidden inline-flex text-[12px] font-bold text-white bg-[#e02424] hover:bg-[#c81e1e] px-3.5 py-1 rounded-full transition-colors shadow-xs"
            >
              Sign up
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="md:hidden inline-flex text-[12px] font-bold text-[#1d1d1f] bg-[#f5f5f7] border border-[#d2d2d7]/70 px-3 py-1 rounded-full transition-colors"
            >
              Dashboard
            </Link>
          )}

          {/* Mobile hamburger */}
          <MobileMenu userEmail={user?.email} isPremium={isPremium} />
        </div>
      </div>
    </header>
  )
}

