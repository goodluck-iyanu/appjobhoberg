import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hoberg Jobs - Secure Remote Jobs',
  description: 'Discover legitimate remote opportunities.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="font-bold text-xl tracking-tight">Hoberg Jobs</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/jobs" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Find Jobs</Link>
              <Link href="/premium" className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors">Premium</Link>
              <div className="h-4 w-px bg-gray-300"></div>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Log in</Link>
              <Link href="/signup" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Sign up</Link>
            </nav>
          </div>
        </header>
        
        <main className="flex-1">
          {children}
        </main>

        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} Hoberg Jobs. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
