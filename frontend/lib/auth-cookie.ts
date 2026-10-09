import { NextRequest, NextResponse } from 'next/server'

export const COOKIE_NAME = 'evadia_token'

const useSecureCookie = process.env.COOKIE_SECURE === 'true'

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: useSecureCookie,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 120,
  })
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: useSecureCookie,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export function getTokenFromRequest(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE_NAME)?.value
}
