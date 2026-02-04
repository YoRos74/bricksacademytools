import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Vérifier que l'utilisateur est approuvé (présent dans la table users)
  const { data: approvedUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', user.email)
    .single()

  if (!approvedUser) {
    // L'utilisateur n'est pas approuvé, le déconnecter et rediriger
    await supabase.auth.signOut()
    redirect('/?error=not_approved')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F6] via-[#FCEEE8] to-[#F9DDD3]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF6B35] rounded-xl flex items-center justify-center shadow-sm">
              <div className="grid grid-cols-2 gap-1">
                <div className="w-2.5 h-2.5 bg-white/90 rounded-[3px]"></div>
                <div className="w-2.5 h-2.5 bg-white/90 rounded-[3px]"></div>
                <div className="w-2.5 h-2.5 bg-white/90 rounded-[3px]"></div>
                <div className="w-2.5 h-2.5 bg-white/40 rounded-[3px]"></div>
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[#1B2B4B] font-bold text-xl tracking-tight">BRICKS</span>
              <span className="text-[#1B2B4B] text-sm font-normal -mt-0.5">academy</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#5A6B7A] text-sm">{user.email}</span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-[#5A6B7A] hover:text-[#1B2B4B] text-sm transition"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1B2B4B] mb-2">
            Bienvenue sur tes outils
          </h1>
          <p className="text-[#5A6B7A]">
            Accède à tous les outils Bricks Academy pour optimiser tes investissements immobiliers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ToolCard
            icon="📊"
            title="Simulateur de Rentabilité"
            description="Calculez la rentabilité brute, nette et cashflow"
            href="/tools/rentability"
            available={false}
          />
          <ToolCard
            icon="🏠"
            title="Analyse de Biens"
            description="Évaluez le potentiel d'un bien immobilier"
            href="/tools/analysis"
            available={false}
          />
          <ToolCard
            icon="💰"
            title="Plan de Financement"
            description="Simulez vos mensualités et montage financier"
            href="/tools/financing"
            available={false}
          />
          <ToolCard
            icon="📈"
            title="Tableau de Bord"
            description="Suivez vos investissements en un coup d'oeil"
            href="/tools/dashboard"
            available={false}
          />
          <ToolCard
            icon="📝"
            title="Générateur de Documents"
            description="Créez vos documents juridiques facilement"
            href="/tools/documents"
            available={false}
          />
          <ToolCard
            icon="🔍"
            title="Comparateur de Biens"
            description="Comparez plusieurs biens côte à côte"
            href="/tools/compare"
            available={false}
          />
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-[#1B2B4B] mb-2">
            Bientôt disponible
          </h2>
          <p className="text-[#5A6B7A]">
            Ces outils sont en cours de développement. Tu seras notifié par email dès
            qu&apos;ils seront disponibles. En attendant, n&apos;hésite pas à nous faire part
            de tes suggestions !
          </p>
        </div>
      </main>
    </div>
  )
}

function ToolCard({
  icon,
  title,
  description,
  href,
  available,
}: {
  icon: string
  title: string
  description: string
  href: string
  available: boolean
}) {
  const CardContent = (
    <>
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-[#1B2B4B] mb-2">{title}</h3>
      <p className="text-[#5A6B7A] mb-4">{description}</p>
      {!available && (
        <span className="inline-block px-3 py-1 bg-[#FDF8F6] text-[#5A6B7A] text-sm rounded-full">
          Bientôt disponible
        </span>
      )}
    </>
  )

  if (available) {
    return (
      <Link
        href={href}
        className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition block"
      >
        {CardContent}
      </Link>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md opacity-75 cursor-not-allowed">
      {CardContent}
    </div>
  )
}
