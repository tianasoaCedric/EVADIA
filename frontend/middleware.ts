import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth-cookie'

// Pages qui nécessitent une authentification
const PROTECTED_PATHS = ['/profil', '/reservations', '/favorite']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(COOKIE_NAME)?.value

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))

  // Redirige vers /login si la page est privée et qu'il n'y a pas de token
  if (isProtected && !token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // /login et /register restent accessibles même avec un cookie présent : le
  // token peut être expiré/invalide côté backend. Les pages elles-mêmes
  // redirigent déjà proprement un utilisateur réellement connecté.
  return NextResponse.next()
}

export const config = {
  // Exclut les assets statiques et les routes API Next.js du middleware
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
