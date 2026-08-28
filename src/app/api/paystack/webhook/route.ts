import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-paystack-signature')
    const secret = process.env.PAYSTACK_SECRET_KEY

    // If secret exists, verify HMAC SHA512 signature
    if (secret && signature) {
      const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
      if (hash !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    }

    const payload = JSON.parse(rawBody)

    if (payload.event === 'charge.success') {
      const data = payload.data
      const reference = data.reference
      const userId = data.metadata?.user_id
      const customerEmail = data.customer?.email
      const planTier = data.metadata?.plan_tier || 'founding_member'
      const amount = data.amount ? data.amount / 100 : 4000

      const adminSupabase = createAdminClient()

      // 1. Upgrade user by user_id or customer email
      if (userId) {
        await adminSupabase
          .from('profiles')
          .update({
            is_premium: true,
            premium_tier: planTier,
            premium_since: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        try {
          await adminSupabase.from('payments').insert({
            user_id: userId,
            reference: reference,
            amount: amount,
            currency: data.currency || 'NGN',
            status: 'success',
            plan_tier: planTier,
          })
        } catch {}
      } else if (customerEmail) {
        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .maybeSingle()

        if (profile) {
          await adminSupabase
            .from('profiles')
            .update({
              is_premium: true,
              premium_tier: planTier,
              premium_since: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id)

          try {
            await adminSupabase.from('payments').insert({
              user_id: profile.id,
              reference: reference,
              amount: amount,
              currency: data.currency || 'NGN',
              status: 'success',
              plan_tier: planTier,
            })
          } catch {}
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
