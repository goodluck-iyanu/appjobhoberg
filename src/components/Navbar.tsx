import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import MobileMenu from '@/components/MobileMenu'
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
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-7 h-7 bg-[#1d1d1f] rounded-lg flex items-center justify-center
                        transition-transform duration-200 group-hover:scale-105"
          >
            <span className="font-bold text-[14px] leading-none text-white">
              H
            </span>
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-[#1d1d1f]">
            Hoberg Jobs
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
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  Log out
                </button>
              </form>
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

          {/* Mobile hamburger */}
          <MobileMenu userEmail={user?.email} isPremium={isPremium} />
        </div>
      </div>
    </header>
  )
}

