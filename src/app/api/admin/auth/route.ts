import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_EMAIL = 'info@hoberg.com.ng'
const ADMIN_PASSWORD = 'passwordadmin'
const ADMIN_TOKEN = 'hoberg_admin_secure_session_token_2026'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (
      email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
      password === ADMIN_PASSWORD
    ) {
      const cookieStore = await cookies()
      cookieStore.set('hoberg_admin_token', ADMIN_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return NextResponse.json({ success: true, message: 'Authenticated successfully' })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid admin email or password' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal authentication error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hoberg_admin_token')?.value

  if (token === ADMIN_TOKEN) {
    return NextResponse.json({ authenticated: true, email: ADMIN_EMAIL })
  }

  return NextResponse.json({ authenticated: false }, { status: 401 })
}
