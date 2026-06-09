import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookie } from '@/lib/auth-cookie'

const API_BASE_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export async function POST(req: NextRequest) {
  const { token } = await req.json()

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ message: 'Token manquant' }, { status: 400 })
  }

  // Vérifie que le token est valide auprès du backend
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })

  if (!res.ok) {
    return NextResponse.json({ message: 'Token invalide' }, { status: 401 })
  }

  const { user } = await res.json()
  const isClient = user.roles?.some((r: { code: string }) => r.code === 'client')

  if (!isClient) {
    return NextResponse.json({ message: 'not_client' }, { status: 403 })
  }

  const response = NextResponse.json({ user })
  setAuthCookie(response, token)
  return response
}
