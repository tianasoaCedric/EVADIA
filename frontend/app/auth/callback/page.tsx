'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService } from '@/lib/services'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError('La connexion avec Google a échoué. Veuillez réessayer.')
      setTimeout(() => router.push('/login'), 3000)
      return
    }

    if (!token) {
      router.push('/login')
      return
    }

    // Stocke le token puis vérifie le profil utilisateur
    localStorage.setItem('evadia_token', token)

    authService.me()
      .then(({ user }) => {
        const isClient = user.roles?.some((r: { code: string }) => r.code === 'clients')
        if (!isClient) {
          localStorage.removeItem('evadia_token')
          router.push('/login?error=not_client')
          return
        }
        router.push('/')
      })
      .catch(() => {
        localStorage.removeItem('evadia_token')
        router.push('/login?error=google_failed')
      })
  }, [router, searchParams])

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: 'url("/photos/bc.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="text-center text-white">
        {error ? (
          <p className="text-red-300">{error}</p>
        ) : (
          <p className="text-lg">Connexion en cours...</p>
        )}
      </div>
    </main>
  )
}
