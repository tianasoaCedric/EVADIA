import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth-cookie'

// Pages qui nécessitent une authentification
const PROTECTED_PATHS = ['/profil', '/reservations', '/favorite']

// Pages accessibles uniquement aux visiteurs non connectés
const AUTH_PATHS = ['/login', '/register']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(COOKIE_NAME)?.value

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p))

  // Redirige vers /login si la page est privée et qu'il n'y a pas de token
  if (isProtected && !token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Redirige vers / si déjà connecté et qu'on tente d'accéder à /login ou /register
  if (isAuthPage && token) {
    const url = req.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.delete('redirect')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Exclut les assets statiques et les routes API Next.js du middleware
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
