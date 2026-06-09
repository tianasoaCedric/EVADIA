import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest, clearAuthCookie } from '@/lib/auth-cookie'

const API_BASE_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req)

  if (token) {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    }).catch(() => {})
  }

  const response = NextResponse.json({ success: true })
  clearAuthCookie(response)
  return response
}
