import { useState, useEffect, useRef } from 'react'

interface UseOnScreenOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number
  /**
   * Une fois visible, rester visible (idéal pour les animations d'entrée).
   * Par défaut true.
   */
  once?: boolean
}

export function useOnScreen<T extends HTMLElement = HTMLElement>(
  options: UseOnScreenOptions = {}
): [(node: T | null) => void, boolean] {
  const { root = null, rootMargin = '50px', threshold = 0.05, once = true } = options

  const [ref, setRef] = useState<T | null>(null)
  // Démarre visible côté serveur pour éviter le flash au chargement
  const [isVisible, setIsVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!ref) return

    // Pas de support → visible directement
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    // Nettoyage de l'observer précédent
    observerRef.current?.disconnect()

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observerRef.current?.disconnect()
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { root, rootMargin, threshold }
    )

    observerRef.current.observe(ref)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [ref, root, rootMargin, threshold, once])

  return [setRef, isVisible]
}
