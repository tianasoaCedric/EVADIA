const KEY = 'evadia_hero_image'

export function setHeroImage(url: string) {
  if (typeof window !== 'undefined') sessionStorage.setItem(KEY, url)
}

export function getHeroImage(fallback: string): string {
  if (typeof window === 'undefined') return fallback
  return sessionStorage.getItem(KEY) || fallback
}
