const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost/api'

export interface SearchHotel {
  id: number
  nom: string
  ville: string | null
  pays: string | null
  etoiles: number
  photo_principale: string | null
  prix_min_mga: number | null
  prix_min_eur: number | null
  note_moyenne: number | null
}

export interface SearchDestination {
  id: number
  nom: string
  image_url: string | null
}

export interface SearchVille {
  id: number
  nom: string
  destination_nom: string | null
  image: string | null
}

export interface SearchType {
  id: number
  nom: string
  image: string | null
}

export interface SearchDecouverteVille {
  id: number
  nom: string
  slug: string
  image: string | null
}

export interface SearchDecouverteLieu {
  id: number
  nom: string
  slug: string
  ville_slug: string | null
  ville_nom: string | null
  image: string | null
}

export interface SearchResults {
  hotels: SearchHotel[]
  destinations: SearchDestination[]
  villes: SearchVille[]
  types: SearchType[]
  decouverte_villes: SearchDecouverteVille[]
  decouverte_lieux: SearchDecouverteLieu[]
}

const EMPTY: SearchResults = {
  hotels: [], destinations: [], villes: [], types: [],
  decouverte_villes: [], decouverte_lieux: [],
}

/** Fetch sans le cache Next.js — utilisé côté client uniquement */
export async function fetchSearch(
  q: string,
  suggest: boolean,
  signal?: AbortSignal,
): Promise<SearchResults> {
  if (q.trim().length < 2) return EMPTY

  const url = `${API_BASE}/search?q=${encodeURIComponent(q.trim())}${suggest ? '&suggest=1' : ''}`

  const res = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) return EMPTY
  return res.json() as Promise<SearchResults>
}

/** Crée une fonction debounce qui annule la requête précédente automatiquement */
export function createSearchDebounce(delayMs = 250) {
  let timer: ReturnType<typeof setTimeout> | null = null
  let controller: AbortController | null = null

  return function debounced(
    q: string,
    suggest: boolean,
    onResult: (r: SearchResults) => void,
    onLoading: (v: boolean) => void,
  ) {
    if (timer) clearTimeout(timer)
    if (controller) controller.abort()

    if (q.trim().length < 2) {
      onResult(EMPTY)
      onLoading(false)
      return
    }

    onLoading(true)
    controller = new AbortController()
    const sig = controller.signal

    timer = setTimeout(async () => {
      try {
        const results = await fetchSearch(q, suggest, sig)
        onResult(results)
      } catch {
        // aborted — ne rien faire
      } finally {
        onLoading(false)
      }
    }, delayMs)
  }
}
