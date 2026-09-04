import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { planId, planName, amountNgn, kobo } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Please log in to continue' }, { status: 401 })
    }

    const email = user.email || 'customer@example.com'
    const reference = `hoberg_${planId || 'pro'}_${user.id.slice(0, 8)}_${Date.now()}`
    const { origin } = new URL(request.url)
    const callbackUrl = `${origin}/app?upgraded=true&reference=${reference}&plan=${planId || 'pro_monthly'}`

    const finalKobo = kobo || (amountNgn ? amountNgn * 100 : 250000)
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY

    // If secret key is provided, use Paystack's official initialization API
    if (paystackSecret && paystackSecret.startsWith('sk_')) {
      const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: finalKobo,
          reference,
          callback_url: callbackUrl,
          metadata: {
            user_id: user.id,
            plan_id: planId || 'pro_monthly',
            plan_name: planName || 'Hoberg Pro',
            custom_fields: [
              {
                display_name: 'User ID',
                variable_name: 'user_id',
                value: user.id,
              },
              {
                display_name: 'Product',
                variable_name: 'product',
                value: planId,
              },
            ],
          },
        }),
      })

      const paystackData = await paystackRes.json()

      if (paystackData.status && paystackData.data?.authorization_url) {
        return NextResponse.json({
          authorization_url: paystackData.data.authorization_url,
          reference,
        })
      } else {
        console.error('Paystack initialization error:', paystackData)
        return NextResponse.json({ error: paystackData.message || 'Payment provider error' }, { status: 400 })
      }
    }

    // Development/Test mode fallback simulation
    return NextResponse.json({
      authorization_url: callbackUrl,
      reference,
      is_simulated: true,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
