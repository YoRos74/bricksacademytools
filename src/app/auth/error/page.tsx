import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">!</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Erreur d&apos;authentification
        </h1>
        <p className="text-gray-600 mb-6">
          Le lien de connexion est invalide ou a expiré.
          Veuillez demander un nouveau lien d&apos;accès.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
