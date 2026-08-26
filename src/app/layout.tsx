import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://jobs.hoberg.com.ng'),
  title: {
    default: 'Hoberg Jobs — Verified Remote Opportunities Worldwide',
    template: '%s | Hoberg Jobs',
  },
  description:
    'Discover legitimate, verified remote opportunities worldwide across all industries. Built by Hoberg Digital Agency.',
  keywords: [
    'Remote Jobs',
    'Nigeria Remote Jobs',
    'Work From Home Africa',
    'Remote Tech Jobs',
    'Virtual Assistant Jobs',
    'Customer Support Remote',
    'Hoberg Jobs',
  ],
  authors: [{ name: 'Hoberg Digital Agency', url: 'https://hoberg.com.ng' }],
  creator: 'Hoberg Digital Agency',
  publisher: 'Hoberg Digital Agency',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jobs.hoberg.com.ng',
    title: 'Hoberg Jobs — Verified Remote Opportunities Worldwide',
    description:
      'Discover legitimate, verified remote opportunities worldwide across all industries. Built by Hoberg Digital Agency.',
    siteName: 'Hoberg Jobs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hoberg Jobs — Verified Remote Opportunities Worldwide',
    description:
      'Discover legitimate, verified remote opportunities worldwide across all industries. Built by Hoberg Digital Agency.',
    creator: '@hobergdigital',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {/* ─── Dynamic Navbar ─── */}
        <Navbar />

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
                  Curated remote opportunities from world-class companies worldwide.
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
                <a
                  href="https://hoberg.com.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0066cc] hover:underline"
                >
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
