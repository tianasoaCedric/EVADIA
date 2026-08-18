// Server-side uses API_BASE_URL (internal Docker network), client uses NEXT_PUBLIC_API_BASE_URL (public URL)
const API_BASE_URL =
  (typeof window === 'undefined' ? process.env.API_BASE_URL : undefined) ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  ''

// ─── Erreur API typée ─────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ─── Options de requête ───────────────────────────────────────────────────────

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Durée de revalidation Next.js en secondes (GET public uniquement). 0 = no-store */
  revalidate?: number | false
  /** Si true, une 401 lève une ApiError sans rediriger vers /login */
  silent?: boolean
}

// ─── Fonction de requête centrale ────────────────────────────────────────────

const REQUEST_TIMEOUT_MS = 15_000

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, revalidate, silent = false } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  // Pour les routes internes Next.js (/api/auth/*), le cookie est envoyé
  // automatiquement par le navigateur via credentials: 'include'.
  const isInternalRoute = endpoint.startsWith('/api/')

  const nextCache = method === 'GET' && !isInternalRoute && revalidate !== undefined
    ? { next: { revalidate } }
    : method === 'GET' && !isInternalRoute
      ? { next: { revalidate: 300 } }
      : { cache: 'no-store' as RequestCache }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  const url = isInternalRoute ? endpoint : `${API_BASE_URL}${endpoint}`

  // credentials: 'include' uniquement pour les routes internes Next.js (/api/auth/*)
  // Les appels directs au backend Laravel utilisent 'omit' (token Bearer, pas cookie)
  const credentials = isInternalRoute ? 'include' : 'omit'

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      credentials,
      signal: controller.signal,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...nextCache,
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError(408, 'La requête a pris trop de temps')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }

  if (response.status === 401) {
    if (!silent && typeof window !== 'undefined') {
      const pathname = window.location.pathname
      if (!pathname.startsWith('/login') && !pathname.startsWith('/register')) {
        const returnTo = encodeURIComponent(pathname)
        window.location.href = `/login?redirect=${returnTo}`
      }
    }
    throw new ApiError(401, 'Connexion requise')
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new ApiError(
      response.status,
      payload.message ?? 'Une erreur est survenue',
      payload.errors,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

// ─── Client exporté ───────────────────────────────────────────────────────────

export const apiClient = {
  get<T>(endpoint: string, revalidate?: number | false) {
    return request<T>(endpoint, { method: 'GET', revalidate })
  },
  /** Comme get() mais ne redirige pas vers /login sur 401 — pour les chargements silencieux */
  silentGet<T>(endpoint: string) {
    return request<T>(endpoint, { method: 'GET', silent: true })
  },
  post<T>(endpoint: string, body: unknown) {
    return request<T>(endpoint, { method: 'POST', body })
  },
  /** Comme post() mais ne redirige pas vers /login sur 401 — pour les appels de fond */
  silentPost<T>(endpoint: string, body: unknown) {
    return request<T>(endpoint, { method: 'POST', body, silent: true })
  },
  put<T>(endpoint: string, body: unknown) {
    return request<T>(endpoint, { method: 'PUT', body })
  },
  patch<T>(endpoint: string, body?: unknown) {
    return request<T>(endpoint, { method: 'PATCH', body })
  },
  delete<T>(endpoint: string) {
    return request<T>(endpoint, { method: 'DELETE' })
  },
}
