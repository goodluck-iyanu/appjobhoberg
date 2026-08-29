import Link from 'next/link'
import { Search, ArrowLeft } from '@/components/icons'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center bg-white">
      <div className="w-16 h-16 bg-[#f5f5f7] rounded-2xl flex items-center justify-center mb-6 border border-[#d2d2d7]/50 mx-auto shadow-sm">
        <Search className="w-8 h-8 text-[#86868b]" />
      </div>
      
      <h1 className="text-4xl sm:text-5xl font-semibold text-[#1d1d1f] tracking-tight mb-4">
        Page not found.
      </h1>
      
      <p className="text-[17px] text-[#86868b] max-w-md mx-auto mb-10 leading-relaxed">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm mx-auto">
        <Link 
          href="/"
          className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-[#0066cc] text-white text-[15px] font-medium hover:bg-[#0077ed] transition-colors w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Homepage
        </Link>
        <Link 
          href="/jobs"
          className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-[15px] font-medium hover:bg-[#e8e8ed] transition-colors w-full sm:w-auto border border-[#d2d2d7]/40"
        >
          Browse Jobs
        </Link>
      </div>
    </div>
  )
}

