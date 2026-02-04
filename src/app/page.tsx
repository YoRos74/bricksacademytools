'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'exists'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    const supabase = createClient()

    const { error } = await supabase
      .from('access_requests')
      .insert({ email, status: 'pending' })

    if (error) {
      if (error.code === '23505') {
        setStatus('exists')
      } else {
        setStatus('error')
        setErrorMessage(error.message)
      }
      return
    }

    setStatus('success')
    setEmail('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F6] via-[#FCEEE8] to-[#F9DDD3]">
      {/* Header */}
      <header className="py-5 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo icon - 40x40px avec coins arrondis */}
            <div className="w-10 h-10 bg-[#FF6B35] rounded-xl flex items-center justify-center shadow-sm">
              <div className="grid grid-cols-2 gap-1">
                <div className="w-2.5 h-2.5 bg-white/90 rounded-[3px]"></div>
                <div className="w-2.5 h-2.5 bg-white/90 rounded-[3px]"></div>
                <div className="w-2.5 h-2.5 bg-white/90 rounded-[3px]"></div>
                <div className="w-2.5 h-2.5 bg-white/40 rounded-[3px]"></div>
              </div>
            </div>
            {/* Logo text */}
            <div className="flex flex-col leading-none">
              <span className="text-[#1B2B4B] font-bold text-xl tracking-tight">BRICKS</span>
              <span className="text-[#1B2B4B] text-sm font-normal -mt-0.5">academy</span>
            </div>
          </div>
          <a
            href="https://www.skool.com/ownrs-club"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white text-sm font-medium py-2.5 px-5 rounded-lg transition"
          >
            Retour à l&apos;academy
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 pt-12 pb-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1B2B4B] mb-5">
            Vos <span className="text-[#FF6B35]">outils immobiliers</span>
          </h1>
          <p className="text-lg text-[#5A6B7A] max-w-2xl mx-auto leading-relaxed">
            Une suite d&apos;outils conçus pour les investisseurs immobiliers du club. Calculateurs,
            simulateurs et analyses pour optimiser vos investissements.
          </p>
        </div>

        {/* Access Request Card */}
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-[#1B2B4B] mb-2 text-center">
            Accédez à vos outils
          </h2>
          <p className="text-[#5A6B7A] text-center text-sm mb-6">
            Entrez votre email pour recevoir un lien de<br />connexion sécurisé
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition text-[#1B2B4B] placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-semibold py-3.5 px-6 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              {status === 'loading' ? 'Envoi en cours...' : 'Obtiens ton lien d\'accès'}
            </button>
          </form>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-white text-xs font-medium">J</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white flex items-center justify-center text-white text-xs font-medium">M</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium">S</div>
            </div>
            <span className="text-sm text-[#5A6B7A]">+1000 membres actifs</span>
          </div>

          {status === 'success' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-800 text-center text-sm">
                ✅ Demande envoyée ! Vous recevrez un email dès que votre accès sera validé.
              </p>
            </div>
          )}

          {status === 'exists' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 text-center text-sm">
                ⚠️ Cet email a déjà été enregistré. Vérifiez vos emails ou patientez.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800 text-center text-sm">
                ❌ Une erreur est survenue : {errorMessage}
              </p>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm border border-white/80 rounded-full py-2.5 px-5">
            <span className="text-sm text-[#5A6B7A]">Outils réservés au membres du club</span>
            <a
              href="https://www.skool.com/ownrs-club"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#FF6B35] font-medium hover:underline flex items-center gap-1"
            >
              Devenir membre
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
