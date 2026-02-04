import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Vérifier si l'utilisateur est approuvé (présent dans la table users)
  const { data: approvedUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (!approvedUser) {
    // Vérifier si une demande existe
    const { data: request } = await supabase
      .from('access_requests')
      .select('status')
      .eq('email', email)
      .single()

    if (!request) {
      return NextResponse.json({
        status: 'not_found',
        message: 'Aucune demande trouvée pour cet email'
      })
    }

    if (request.status === 'pending') {
      return NextResponse.json({
        status: 'pending',
        message: 'Votre demande est en attente de validation'
      })
    }

    if (request.status === 'rejected') {
      return NextResponse.json({
        status: 'rejected',
        message: 'Votre demande a été refusée'
      })
    }
  }

  // L'utilisateur est approuvé, envoyer un magic link
  const { error: authError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (authError) {
    console.error('Error sending magic link:', authError.message, authError)
    return NextResponse.json({
      status: 'error',
      message: `Erreur: ${authError.message}`
    }, { status: 500 })
  }

  return NextResponse.json({
    status: 'sent',
    message: 'Lien de connexion envoyé !'
  })
}
