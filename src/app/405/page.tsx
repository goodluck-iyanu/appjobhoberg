import Link from 'next/link'
import { ArrowRight, ShieldCheck } from '@/components/icons'

export default function MethodNotAllowed() {
  return (
    <div className="flex-1 bg-[#f5f5f7] flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
        <ShieldCheck className="w-8 h-8 text-amber-600" />
      </div>
      <h1 className="text-4xl font-bold text-[#1d1d1f] mb-3">Method Not Allowed (405)</h1>
      <p className="text-[16px] text-[#86868b] max-w-sm mx-auto mb-8">
        The action you tried to perform is not allowed on this route. Please return to the main dashboard.
      </p>
      <Link href="/jobs" className="inline-flex items-center gap-2 bg-[#1d1d1f] hover:bg-black text-white px-6 py-3.5 rounded-full font-semibold text-[14px] transition-all shadow-sm">
        <span>Browse Jobs</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}
