import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { reference, planTier, amount } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
    }

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
    if (paystackSecretKey) {
      const verifyRes = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
          },
        }
      )
      const verifyData = await verifyRes.json()
      if (!verifyData.status || verifyData.data?.status !== 'success') {
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
      }
    }

    // 1. Upgrade User Profile to Premium
    const tier = planTier || 'founding_member'
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        is_premium: true,
        premium_tier: tier,
        premium_since: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Failed to update profile premium status:', profileError)
    }

    // 2. Record Payment in payments table
    await supabase.from('payments').insert({
      user_id: user.id,
      reference,
      amount: amount || (tier === 'founding_member' ? 4000 : 5000),
      currency: 'NGN',
      status: 'success',
      plan_tier: tier,
    })

    return NextResponse.json({
      success: true,
      message: 'Account successfully upgraded to Premium!',
      tier,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
