import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookie } from '@/lib/auth-cookie'

const API_BASE_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export async function POST(req: NextRequest) {
  const body = await req.json()

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status })
  }

  const response = NextResponse.json({ user: data.user })
  setAuthCookie(response, data.token)
  return response
}
