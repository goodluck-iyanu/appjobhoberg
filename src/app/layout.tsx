import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import MobileMenu from '@/components/MobileMenu'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Hoberg Jobs — Premium Remote Work',
  description:
    'Discover curated remote opportunities from world-class companies. Your next career move starts here.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${inter.className} min-h-screen flex flex-col`}
      >
        {/* ─── Navbar ─── */}
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
                           transition-colors duration-200"
              >
                Premium
              </Link>
            </nav>

            {/* Right side: auth + mobile menu */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden md:inline-flex text-[13px] font-medium text-[#1d1d1f]/70
                           hover:text-[#1d1d1f] transition-colors duration-200"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="hidden md:inline-flex text-[13px] font-medium text-white
                           bg-[#0066cc] hover:bg-[#0077ed] px-4 py-1.5 rounded-full
                           transition-colors duration-200"
              >
                Sign up
              </Link>

              {/* Mobile hamburger */}
              <MobileMenu />
            </div>
          </div>
        </header>

        {/* ─── Main ─── */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* ─── Footer ─── */}
        <footer className="bg-[#f5f5f7] border-t border-black/[0.04] mt-auto">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top row */}
            <div className="py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              {/* Brand */}
              <div className="space-y-1">
                <p className="font-semibold text-[13px] text-[#1d1d1f]">
                  Hoberg Jobs
                </p>
                <p className="text-[12px] text-[#86868b] max-w-xs leading-relaxed">
                  Curated remote opportunities from world-class companies.
                </p>
              </div>

              {/* Link columns */}
              <div className="flex gap-10 text-[12px]">
                <div className="space-y-2">
                  <p className="font-semibold text-[#1d1d1f]">Platform</p>
                  <Link
                    href="/jobs"
                    className="block text-[#86868b] hover:text-[#1d1d1f] transition-colors duration-200"
                  >
                    Find Jobs
                  </Link>
                  <Link
                    href="/categories"
                    className="block text-[#86868b] hover:text-[#1d1d1f] transition-colors duration-200"
                  >
                    Categories
                  </Link>
                  <Link
                    href="/premium"
                    className="block text-[#86868b] hover:text-[#1d1d1f] transition-colors duration-200"
                  >
                    Premium
                  </Link>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-[#1d1d1f]">Legal</p>
                  <Link
                    href="#"
                    className="block text-[#86868b] hover:text-[#1d1d1f] transition-colors duration-200"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="#"
                    className="block text-[#86868b] hover:text-[#1d1d1f] transition-colors duration-200"
                  >
                    Terms of Use
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-black/[0.04] py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-[11px] text-[#86868b]">
                Copyright &copy; {new Date().getFullYear()} Hoberg Jobs. Built by{' '}
                <a href="https://hoberg.com.ng" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] hover:underline">
                  Hoberg Digital Agency
                </a>
                . All rights reserved.
              </p>
              <div className="flex gap-5 text-[11px]">
                <Link
                  href="#"
                  className="text-[#86868b] hover:text-[#1d1d1f] transition-colors duration-200"
                >
                  Privacy
                </Link>
                <span className="text-[#d2d2d7]">|</span>
                <Link
                  href="#"
                  className="text-[#86868b] hover:text-[#1d1d1f] transition-colors duration-200"
                >
                  Terms
                </Link>
                <span className="text-[#d2d2d7]">|</span>
                <Link
                  href="#"
                  className="text-[#86868b] hover:text-[#1d1d1f] transition-colors duration-200"
                >
                  Sitemap
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
