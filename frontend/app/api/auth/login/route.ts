import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookie } from '@/lib/auth-cookie'

const API_BASE_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Corps de requête invalide' }, { status: 400 })
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    return NextResponse.json({ message: 'Impossible de contacter le serveur' }, { status: 502 })
  }

  const text = await res.text()
  let data: Record<string, unknown>
  try {
    data = JSON.parse(text)
  } catch {
    console.error('[login] réponse non-JSON du backend:', res.status, text.slice(0, 200))
    return NextResponse.json({ message: 'Erreur serveur inattendue' }, { status: 502 })
  }

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status })
  }

  const response = NextResponse.json({ user: data.user })
  setAuthCookie(response, data.token as string)
  return response
}
