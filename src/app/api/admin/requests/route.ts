import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Check admin authentication
function isAuthenticated(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get('admin_session')
  return sessionCookie?.value === 'authenticated'
}

// GET: Fetch all access requests
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('access_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ requests: data })
}

// PATCH: Update request status
export async function PATCH(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, status, email } = await request.json()

  const supabase = await createClient()

  // Update the request status
  const { error: updateError } = await supabase
    .from('access_requests')
    .update({ status })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // If approved, send magic link and add to users table
  if (status === 'approved') {
    // Add user to users table
    const { error: userError } = await supabase
      .from('users')
      .upsert({ email, is_admin: false }, { onConflict: 'email' })

    if (userError) {
      console.error('Error adding user:', userError)
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'ajout de l\'utilisateur: ' + userError.message,
      }, { status: 500 })
    }

    // Send magic link via Supabase Auth
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (authError) {
      console.error('Error sending magic link:', authError)
      return NextResponse.json({
        success: false,
        error: 'Utilisateur approuvé mais le magic link n\'a pas pu être envoyé: ' + authError.message,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Magic link envoyé à ${email}`,
      email
    })
  }

  if (status === 'rejected') {
    return NextResponse.json({
      success: true,
      message: `Demande de ${email} refusée`,
      email
    })
  }

  return NextResponse.json({ success: true })
}
