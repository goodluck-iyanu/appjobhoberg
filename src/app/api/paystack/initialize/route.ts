import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { amount, planTier, customPaymentLink } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Please log in to continue' }, { status: 401 })
    }

    const email = user.email || 'customer@example.com'
    const reference = `hoberg_${planTier || 'founding'}_${user.id.slice(0, 8)}_${Date.now()}`
    const { origin } = new URL(request.url)
    const callbackUrl = `${origin}/dashboard?upgraded=true&reference=${reference}`

    // If user provided a custom Paystack Payment Page link
    if (customPaymentLink && customPaymentLink.startsWith('http')) {
      return NextResponse.json({
        authorization_url: customPaymentLink,
        reference,
      })
    }

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
          amount: (amount || 4000) * 100, // Paystack uses Kobo (NGN * 100)
          reference,
          callback_url: callbackUrl,
          metadata: {
            user_id: user.id,
            plan_tier: planTier || 'founding_member',
            custom_fields: [
              {
                display_name: 'User ID',
                variable_name: 'user_id',
                value: user.id,
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
      }
    }

    // Test mode fallback simulation
    return NextResponse.json({
      authorization_url: callbackUrl,
      reference,
      is_simulated: true,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

