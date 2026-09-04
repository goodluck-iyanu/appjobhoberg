import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; reference?: string; trxref?: string }>
}) {
  const params = await searchParams
  const reference = params.reference || params.trxref
  const upgraded = params.upgraded

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/app')
  }

  // Handle Paystack callback upgrade if returned here
  if (upgraded === 'true' || reference) {
    try {
      const adminSupabase = createAdminClient()
      const paystackSecret = process.env.PAYSTACK_SECRET_KEY

      if (paystackSecret && reference && !reference.startsWith('sim_')) {
        const verifyRes = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
          {
            headers: { Authorization: `Bearer ${paystackSecret}` },
            cache: 'no-store',
          }
        )
        const verifyData = await verifyRes.json()
        if (verifyData.status && (verifyData.data?.status === 'success' || verifyData.data?.gateway_response === 'Successful')) {
          await adminSupabase
            .from('profiles')
            .update({
              is_premium: true,
              premium_tier: 'pro_monthly',
              premium_since: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)
        }
      }
    } catch {}
  }

  redirect('/app')
}
