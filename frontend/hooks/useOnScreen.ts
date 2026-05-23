import { useState, useEffect } from 'react'

interface UseOnScreenOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number
}

export function useOnScreen<T extends HTMLElement = HTMLElement>(
  options: UseOnScreenOptions = {}
): [(node: T | null) => void, boolean] {
  const { root = null, rootMargin = '0px', threshold = 0.1 } = options
  
  const [ref, setRef] = useState<T | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!ref) return

    let lastScrollY = window.scrollY
    let isVisibleState = false

    const handleScroll = () => {
      if (!ref) return
      const rect = ref.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // L'élément est visible quand il est dans l'écran
      const isInViewport = rect.top < windowHeight && rect.bottom > 0
      
      // Détecter la direction du scroll
      const isScrollingDown = window.scrollY > lastScrollY
      lastScrollY = window.scrollY
      
      // Si l'élément est dans l'écran, il devient visible
      if (isInViewport) {
        if (!isVisibleState) {
          isVisibleState = true
          setIsVisible(true)
        }
      } 
      // Si l'élément sort par le bas (scroll vers le bas)
      else if (isScrollingDown && rect.top > windowHeight && isVisibleState) {
        isVisibleState = false
        setIsVisible(false)
      }
      // Si on scroll vers le haut, on garde visible
      else if (!isScrollingDown && isVisibleState) {
        setIsVisible(true)
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [ref])

  return [setRef, isVisible]
}