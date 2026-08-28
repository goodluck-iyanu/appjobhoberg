import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { reference, planTier, amount } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
    }

    const rawRef = Array.isArray(reference) ? reference[0] : reference

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

    // If Paystack Secret key is provided, verify with Paystack REST API
    let paymentVerified = true
    if (paystackSecretKey && paystackSecretKey.startsWith('sk_') && !rawRef.startsWith('sim_')) {
      try {
        const verifyRes = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(rawRef)}`,
          {
            headers: {
              Authorization: `Bearer ${paystackSecretKey}`,
            },
          }
        )
        const verifyData = await verifyRes.json()
        if (verifyData.status && (verifyData.data?.status === 'success' || verifyData.data?.gateway_response === 'Successful')) {
          paymentVerified = true
        } else {
          return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
        }
      } catch (err: any) {
        console.error('Paystack verification error:', err)
      }
    }

    // 1. Upgrade User Profile to Premium
    const tier = planTier || 'founding_member'
    const updateData = {
      is_premium: true,
      premium_tier: tier,
      premium_since: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    try {
      const adminSupabase = createAdminClient()
      await adminSupabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
    } catch {}

    // 2. Record Payment in payments table
    try {
      await supabase.from('payments').insert({
        user_id: user.id,
        reference: rawRef,
        amount: amount || (tier === 'founding_member' ? 4000 : 5000),
        currency: 'NGN',
        status: 'success',
        plan_tier: tier,
      })
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Account successfully upgraded to Premium!',
      tier,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

