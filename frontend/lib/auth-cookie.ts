import { NextRequest, NextResponse } from 'next/server'

export const COOKIE_NAME = 'evadia_token'

const isProduction = process.env.NODE_ENV === 'production'

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,          // inaccessible au JS — protège contre XSS
    secure: isProduction,    // HTTPS uniquement en prod
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 120,        // 120 minutes — aligné avec le TTL Sanctum
  })
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export function getTokenFromRequest(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE_NAME)?.value
}
