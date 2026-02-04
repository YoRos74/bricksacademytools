'use client'

import { useState, useEffect } from 'react'
import { AccessRequest } from '@/types/database'

interface Notification {
  type: 'success' | 'error'
  message: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notification | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        setIsAuthenticated(true)
        fetchRequests()
      } else {
        setError('Mot de passe incorrect')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/requests')
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      } else if (res.status === 401) {
        setIsAuthenticated(false)
      }
    } catch (err) {
      console.error('Error fetching requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, email: string, status: 'approved' | 'rejected') => {
    setActionLoading(id)
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, email, status }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        showNotification('success', data.message || 'Action effectuée')
        fetchRequests()
      } else {
        showNotification('error', data.error || 'Une erreur est survenue')
      }
    } catch (err) {
      console.error('Error updating request:', err)
      showNotification('error', 'Erreur de connexion au serveur')
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    // Check if already authenticated
    fetch('/api/admin/requests')
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true)
          return res.json()
        }
        throw new Error('Not authenticated')
      })
      .then((data) => setRequests(data.requests || []))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setInitialLoading(false))
  }, [])

  // Écran de chargement initial
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FDF8F6] via-[#FCEEE8] to-[#F9DDD3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5A6B7A]">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FDF8F6] via-[#FCEEE8] to-[#F9DDD3] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
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
              <span className="text-[#1B2B4B] text-sm font-normal -mt-0.5">admin</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#1B2B4B] mb-6">Connexion Admin</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#5A6B7A] mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none"
                placeholder="Entrez le mot de passe admin"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending')
  const approvedRequests = requests.filter((r) => r.status === 'approved')
  const rejectedRequests = requests.filter((r) => r.status === 'rejected')

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F6] via-[#FCEEE8] to-[#F9DDD3]">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg transition-all ${
          notification.type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 hover:opacity-70"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

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
              <span className="text-[#1B2B4B] text-sm font-normal -mt-0.5">admin</span>
            </div>
          </div>
          <button
            onClick={() => {
              document.cookie = 'admin_session=; Max-Age=0; path=/'
              setIsAuthenticated(false)
            }}
            className="text-[#5A6B7A] hover:text-[#1B2B4B] text-sm transition"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <StatCard title="En attente" count={pendingRequests.length} color="yellow" />
          <StatCard title="Approuvées" count={approvedRequests.length} color="green" />
          <StatCard title="Refusées" count={rejectedRequests.length} color="red" />
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[#1B2B4B]">
              Demandes en attente ({pendingRequests.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-[#5A6B7A]">Chargement...</div>
          ) : pendingRequests.length === 0 ? (
            <div className="p-6 text-center text-[#5A6B7A]">Aucune demande en attente</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingRequests.map((request) => (
                <div key={request.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1B2B4B]">{request.email}</p>
                    <p className="text-sm text-[#5A6B7A]">
                      {new Date(request.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(request.id, request.email, 'approved')}
                      disabled={actionLoading === request.id}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading === request.id ? (
                        <span className="animate-spin">...</span>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Accepter
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleAction(request.id, request.email, 'rejected')}
                      disabled={actionLoading === request.id}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading === request.id ? (
                        <span className="animate-spin">...</span>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Refuser
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Requests Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[#1B2B4B]">
              Historique des demandes ({requests.length})
            </h2>
          </div>

          {requests.length === 0 ? (
            <div className="p-6 text-center text-[#5A6B7A]">Aucune demande pour le moment</div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#FDF8F6]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6B7A] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6B7A] uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5A6B7A] uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1B2B4B]">
                      {request.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5A6B7A]">
                      {new Date(request.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, count, color }: { title: string; count: number; color: 'yellow' | 'green' | 'red' }) {
  const colorClasses = {
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <div className={`p-6 rounded-2xl border ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-75">{title}</p>
      <p className="text-3xl font-bold">{count}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }

  const labels = {
    pending: 'En attente',
    approved: 'Approuvée',
    rejected: 'Refusée',
  }

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${classes[status as keyof typeof classes]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  )
}
