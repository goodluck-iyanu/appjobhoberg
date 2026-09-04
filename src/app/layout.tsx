import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import Navbar from '@/components/Navbar'
import AppBottomNav from '@/components/AppBottomNav'
import AuthSessionLogger from '@/components/AuthSessionLogger'
import { ToastProvider } from '@/components/Toast'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://jobs.hoberg.com.ng'),
  title: {
    default: 'Hoberg Jobs — Real Jobs in Nigeria & Remote Opportunities',
    template: '%s | Hoberg Jobs',
  },
  description:
    'The least humiliating way to hunt a job in Nigeria. Fewer fake posts, a CV you edit once, honest match scores, apply free, and a tracker so the chaos lives in one place.',
  keywords: [
    'Jobs in Nigeria',
    'Lagos Jobs',
    'Abuja Jobs',
    'Remote Jobs Nigeria',
    'Work From Home Africa',
    'NYSC Jobs',
    'Tech Jobs Nigeria',
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
    locale: 'en_NG',
    url: 'https://jobs.hoberg.com.ng',
    title: 'Hoberg Jobs — Real Jobs in Nigeria & Remote Opportunities',
    description:
      'The least humiliating way to hunt a job in Nigeria. Fewer fake posts, a CV you edit once, honest match scores, apply free, and a tracker so the chaos lives in one place.',
    siteName: 'Hoberg Jobs',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Hoberg Jobs — Built by Hoberg Digital Agency',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hoberg Jobs — Real Jobs in Nigeria & Remote Opportunities',
    description:
      'The least humiliating way to hunt a job in Nigeria. Fewer fake posts, honest match scores, free applications, and an integrated tracker.',
    creator: '@hobergdigital',
    images: ['/opengraph-image'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#fbfbfd] text-[#1d1d1f] pb-16 md:pb-0`}>
        <ToastProvider>
          {/* Real-time auth session logging */}
          <AuthSessionLogger />

          {/* Dynamic Navbar */}
          <Navbar />

          {/* Main content */}
          <main className="flex-1 flex flex-col">{children}</main>

          {/* Mobile Bottom Navigation for Quick One-Tap Access */}
          <AppBottomNav />
        </ToastProvider>

        {/* Public Footer */}
        <footer className="bg-[#f5f5f7] border-t border-black/[0.04] mt-auto">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top row */}
            <div className="py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              {/* Brand */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[18px] text-[#1d1d1f]">
                    <span className="text-[#e02424]">Hoberg</span> Jobs
                  </span>
                  <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    🇳🇬 Nigeria First
                  </span>
                </div>
                <p className="text-[13px] text-[#86868b] max-w-sm leading-relaxed">
                  Real jobs in Lagos, Abuja, and verified remote opportunities that actually hire from Nigeria. Apply is always 100% free.
                </p>
              </div>

              {/* Link columns */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-[13px]">
                <div className="space-y-2.5">
                  <p className="font-semibold text-[#1d1d1f]">Locations</p>
                  <Link href="/jobs/lagos" className="block text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                    Lagos Jobs
                  </Link>
                  <Link href="/jobs/abuja" className="block text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                    Abuja Jobs
                  </Link>
                  <Link href="/jobs/remote-nigeria" className="block text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                    Remote (Nigeria)
                  </Link>
                  <Link href="/jobs/remote-dollar" className="block text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                    Dollar Remote
                  </Link>
                </div>

                <div className="space-y-2.5">
                  <p className="font-semibold text-[#1d1d1f]">For Seekers</p>
                  <Link href="/jobs" className="block text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                    Browse All Jobs
                  </Link>
                  <Link href="/app/cv" className="block text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                    Master CV Upload
                  </Link>
                  <Link href="/app/tracker" className="block text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                    Application Tracker
                  </Link>
                  <Link href="/pricing" className="block text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                    Pricing & Pro
                  </Link>
                </div>

                <div className="space-y-2.5 col-span-2 sm:col-span-1">
                  <p className="font-semibold text-[#1d1d1f]">For Employers</p>
                  <Link href="/employers/post" className="block text-[#e02424] font-medium hover:underline">
                    Post a Job (Free)
                  </Link>
                  <Link href="/privacy_policy" className="block text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="/terms_of_service" className="block text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-black/[0.04] py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-[12px] text-[#86868b]">
                &copy; {new Date().getFullYear()} Hoberg Jobs. Built by{' '}
                <a
                  href="https://hoberg.com.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#e02424] font-semibold hover:underline"
                >
                  Hoberg Digital Agency
                </a>
                . Zero fees to apply.
              </p>
              <div className="flex items-center gap-4 text-[12px] text-[#86868b]">
                <Link href="/privacy_policy" className="hover:text-[#1d1d1f]">
                  Privacy
                </Link>
                <span>·</span>
                  Terms
                </Link>
                <span>·</span>
                <Link href="/pricing" className="hover:text-[#1d1d1f]">
                </Link>
              </div>
            </div>
          </div>
        </footer>
        <CookieConsent />
      </body>
  )
}
