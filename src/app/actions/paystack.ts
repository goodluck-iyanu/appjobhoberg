'use server'

import { createAdminClient } from '@/utils/supabase/admin'

export async function verifyPayment(reference: string) {
  try {
    const adminSupabase = createAdminClient()

    // 1. Check if already processed
    const { data: existing } = await adminSupabase
      .from('purchases')
      .select('id')
      .eq('paystack_ref', reference)
      .maybeSingle()

    if (existing) {
      return { success: true, already_processed: true }
    }

    // 2. Verify with Paystack
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecret) throw new Error('Missing Paystack Key')

    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
      },
    })
    
    const data = await res.json()
    if (!data.status || data.data?.status !== 'success') {
      return { success: false, error: 'Payment not successful' }
    }

    const tx = data.data
    const planId = tx.metadata?.plan_id
    const targetUserId = tx.metadata?.user_id || tx.metadata?.custom_fields?.find((f: any) => f.variable_name === 'user_id')?.value
    
    if (!targetUserId || !planId) {
      return { success: true, warning: 'No user or plan found in metadata' }
    }

    // 3. Process it (similar to webhook)
    await adminSupabase.from('purchases').insert({
      user_id: targetUserId,
      product: planId,
      amount_kobo: tx.amount,
      paystack_ref: reference,
      status: 'success',
      created_at: new Date().toISOString(),
    })

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
          paystack_customer_code: tx.customer?.customer_code || null,
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
      } catch (e) {}

    } else {
      // One-Off Credits
      let kind = 'tailor_cv'
      let delta = 1
      if (planId === 'tailor_pack_3') delta = 3
      if (planId === 'rewrite_full') kind = 'rewrite_cv'
      if (planId === 'cover_letter') kind = 'cover_letter_cv'
      if (planId === 'ats_check') kind = 'ats_check'

      await adminSupabase.from('credit_ledger').insert({
        user_id: targetUserId,
        kind,
        delta,
        reason: 'purchase',
        ref: reference,
        balance_after: delta,
        created_at: new Date().toISOString(),
      })
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
