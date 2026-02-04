import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  const adminPassword = process.env.ADMIN_PASSWORD || 'bricksadmin2024'

  if (password === adminPassword) {
    const response = NextResponse.json({ success: true })

    // Set a simple session cookie (valid for 24 hours)
    response.cookies.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  }

  return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 })
}
