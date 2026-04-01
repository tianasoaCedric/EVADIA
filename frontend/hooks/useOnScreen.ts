import { useState, useEffect, useRef } from 'react'

interface UseOnScreenOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number
  triggerOnce?: boolean
}

export function useOnScreen<T extends HTMLElement = HTMLElement>(
  options: UseOnScreenOptions = {}
): [(node: T | null) => void, boolean] {
  const { root = null, rootMargin = '0px', threshold = 0, triggerOnce = false } = options
  const [ref, setRef] = useState<T | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce && ref) {
            observer.unobserve(ref)
          }
        } else {
          setIsVisible(false)  // ← Déclenche la disparition
        }
      },
      { root, rootMargin, threshold }
    )

    observer.observe(ref)

    return () => {
      if (ref) {
        observer.unobserve(ref)
      }
    }
  }, [ref, root, rootMargin, threshold, triggerOnce])

  return [setRef, isVisible]
}