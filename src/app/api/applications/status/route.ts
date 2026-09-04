import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { appId, status, notes, next_follow_up } = await req.json()

    if (!appId || !status) {
      return NextResponse.json({ success: false, error: 'Missing appId or status' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()
    const updateData: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (notes !== undefined) updateData.notes = notes
    if (next_follow_up !== undefined) updateData.next_follow_up = next_follow_up

    const { error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', appId)
      .eq('user_id', user.id)

    if (error) {
      await adminSupabase
        .from('applications')
        .update(updateData)
        .eq('id', appId)
        .eq('user_id', user.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Application status updated.',
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Server error' },
      { status: 500 }
    )
  }
}

