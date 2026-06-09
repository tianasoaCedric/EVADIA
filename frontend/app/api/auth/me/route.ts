import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth-cookie'

const API_BASE_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req)

  if (!token) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
  }

  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store',
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
