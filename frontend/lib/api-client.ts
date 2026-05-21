const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost/api'

// ─── Gestion du token (côté client uniquement) ────────────────────────────────

export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('evadia_token')
  },
  set: (token: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem('evadia_token', token)
  },
  remove: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('evadia_token')
  },
}

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
  token?: string
  /** Si true, une réponse 401 redirige vers /login au lieu de lever une erreur */
  requiresAuth?: boolean
  /** Durée de revalidation Next.js en secondes (GET public uniquement). 0 = no-store */
  revalidate?: number | false
}

// ─── Fonction de requête centrale ────────────────────────────────────────────

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, requiresAuth = false, revalidate } = options

  const authToken = token ?? tokenStorage.get()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const nextCache = method === 'GET' && !authToken && revalidate !== undefined
    ? { next: { revalidate } }
    : method === 'GET' && !authToken
      ? { next: { revalidate: 60 } }
      : { cache: 'no-store' as RequestCache }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...nextCache,
  })

  // 401 — session expirée ou action nécessitant un compte
  if (response.status === 401) {
    tokenStorage.remove()
    if (typeof window !== 'undefined') {
      const returnTo = encodeURIComponent(window.location.pathname)
      window.location.href = `/login?redirect=${returnTo}`
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

  // 204 No Content — rien à parser
  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

// ─── Client exporté ───────────────────────────────────────────────────────────

export const apiClient = {
  /** Requête publique — fonctionne sans compte (ex: liste des hôtels) */
  get<T>(endpoint: string, token?: string, revalidate?: number | false) {
    return request<T>(endpoint, { method: 'GET', token, revalidate })
  },
  /** Requête authentifiée — redirige vers /login si token absent ou expiré */
  authGet<T>(endpoint: string) {
    return request<T>(endpoint, { method: 'GET', requiresAuth: true })
  },
  post<T>(endpoint: string, body: unknown, token?: string) {
    return request<T>(endpoint, { method: 'POST', body, token })
  },
  put<T>(endpoint: string, body: unknown, token?: string) {
    return request<T>(endpoint, { method: 'PUT', body, token })
  },
  patch<T>(endpoint: string, body?: unknown, token?: string) {
    return request<T>(endpoint, { method: 'PATCH', body, token })
  },
  delete<T>(endpoint: string, token?: string) {
    return request<T>(endpoint, { method: 'DELETE', token })
  },
}
