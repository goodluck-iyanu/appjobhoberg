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
      const planId = data.metadata?.plan_id || 'pro_monthly'
      const amountKobo = data.amount || 250000
      const customerEmail = data.customer?.email

      const adminSupabase = createAdminClient()

      let targetUserId = userId
      if (!targetUserId && customerEmail) {
        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .maybeSingle()
        if (profile) targetUserId = profile.id
      }

      if (targetUserId) {
        // 1. Record purchase
        try {
          await adminSupabase.from('purchases').insert({
            user_id: targetUserId,
            product: planId,
            amount_kobo: amountKobo,
            currency: data.currency || 'NGN',
            paystack_ref: reference,
            status: 'success',
            created_at: new Date().toISOString(),
          })
        } catch {}

        // 2. Handle Subscription Plans (pro_monthly, pro_quarterly, pro_yearly)
        if (planId.startsWith('pro_')) {
          const daysToAdd = planId === 'pro_yearly' ? 365 : planId === 'pro_quarterly' ? 90 : 30
          const periodEnd = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString()

          await adminSupabase
            .from('profiles')
            .update({
              is_premium: true,
              premium_tier: planId,
              premium_since: new Date().toISOString(),
              premium_until: periodEnd,
              updated_at: new Date().toISOString(),
            })
            .eq('id', targetUserId)

          try {
            await adminSupabase.from('subscriptions').insert({
              user_id: targetUserId,
              plan: planId,
              status: 'active',
              period_start: new Date().toISOString(),
              period_end: periodEnd,
              paystack_customer_code: data.customer?.customer_code || null,
            })
          } catch {}

          // Reset and grant Pro Quotas for the new billing period
          try {
            await adminSupabase.from('credit_ledger')
              .delete()
              .eq('user_id', targetUserId)
              .in('kind', ['tailor_quota', 'rewrite_quota', 'cover_letter_quota'])

            await adminSupabase.from('credit_ledger').insert([
              { user_id: targetUserId, kind: 'tailor_quota', delta: 8, reason: 'pro_renewal', balance_after: 8 },
              { user_id: targetUserId, kind: 'rewrite_quota', delta: 2, reason: 'pro_renewal', balance_after: 2 },
              { user_id: targetUserId, kind: 'cover_letter_quota', delta: 8, reason: 'pro_renewal', balance_after: 8 }
            ])
          } catch (e) {
            console.error('Failed to grant quotas', e)
          }
        }

        // 3. Handle One-Off Credit Purchases
        if (planId === 'tailor_single' || planId === 'tailor_pack_3') {
          const delta = planId === 'tailor_pack_3' ? 3 : 1
          try {
            await adminSupabase.from('credit_ledger').insert({
              user_id: targetUserId,
              kind: 'tailor_cv',
              delta,
              reason: 'purchase',
              ref: reference,
              balance_after: delta,
              created_at: new Date().toISOString(),
            })
          } catch {}
        } else if (planId === 'rewrite_full') {
          try {
            await adminSupabase.from('credit_ledger').insert({
              user_id: targetUserId,
              kind: 'rewrite_cv',
              delta: 1,
              reason: 'purchase',
              ref: reference,
              balance_after: 1,
              created_at: new Date().toISOString(),
            })
          } catch {}
        } else if (planId === 'cover_letter') {
          try {
            await adminSupabase.from('credit_ledger').insert({
              user_id: targetUserId,
              kind: 'cover_letter',
              delta: 1,
              reason: 'purchase',
              ref: reference,
              balance_after: 1,
              created_at: new Date().toISOString(),
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
