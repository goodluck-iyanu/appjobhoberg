import { redirect } from 'next/navigation'
import { verifyPayment } from '@/app/actions/paystack'
import Link from 'next/link'
import { CheckCircle } from '@/components/icons'

export const dynamic = 'force-dynamic'

export default async function DashboardRedirectPage({ searchParams }: { searchParams: Promise<{ trxref?: string; reference?: string; plan?: string }> }) {
  const resolvedParams = await searchParams
  const ref = resolvedParams.reference || resolvedParams.trxref
  const plan = resolvedParams.plan || ''

  if (!ref) {
    redirect('/app')
  }

  // Verify and process synchronously
  const result = await verifyPayment(ref)
  
  // Determine target based on plan
  let targetUrl = '/app'
  let targetLabel = 'Dashboard'
  
  if (plan.startsWith('tailor')) {
    targetUrl = '/app/cv' // or back to specific job, but we'll default to CV
    targetLabel = 'Master CV'
  } else if (plan === 'rewrite_full' || plan === 'ats_check' || plan === 'cover_letter') {
    targetUrl = '/app/cv'
    targetLabel = 'Master CV'
  }

  if (!result.success) {
    return (
      <div className="flex-1 bg-[#fbfbfd] flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-[#e02424] font-bold">Payment Verification Failed</p>
          <p className="text-[#86868b] mt-2">{result.error}</p>
          <Link href="/pricing" className="mt-4 inline-block bg-[#1d1d1f] text-white px-6 py-2 rounded-full">
            Return to Pricing
          </Link>
        </div>
      </div>
    )
  }

  // Success UI
  return (
    <div className="flex-1 bg-[#fbfbfd] flex flex-col items-center justify-center p-8 text-center min-h-[100dvh]">
      <CheckCircle className="w-20 h-20 text-emerald-500 mb-6" />
      <h1 className="text-3xl font-bold text-[#1d1d1f] mb-3">Payment Successful!</h1>
      <p className="text-lg text-[#86868b] mb-8">
        Your {plan.startsWith('pro_') ? 'subscription' : 'credit'} has been processed.
      </p>
      
      <Link 
        href={targetUrl}
        className="bg-[#0066cc] hover:bg-[#0055b3] text-white font-semibold px-8 py-3.5 rounded-full transition-colors shadow-sm"
      >
        Continue to {targetLabel} →
      </Link>
    </div>
  )
}
