'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Loading from '@/app/components/ui/Loading'

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

    // Envoie le token au route handler qui le valide et pose le cookie httpOnly.
    // Le token ne touche jamais localStorage.
    fetch('/api/auth/google-callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (res.status === 403) {
          router.push('/login?error=not_client')
          return
        }
        if (!res.ok) {
          router.push('/login?error=google_failed')
          return
        }
        router.push('/')
      })
      .catch(() => router.push('/login?error=google_failed'))
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
          <Loading />
        )}
      </div>
    </main>
  )
}
