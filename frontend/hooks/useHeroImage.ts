'use client'

import { useState, useEffect } from 'react'
import { getHeroImage } from '@/lib/heroImage'

export function useHeroImage(fallback: string): string {
  const [src, setSrc] = useState(fallback)
  useEffect(() => {
    const stored = getHeroImage(fallback)
    if (stored !== fallback) setSrc(stored)
  }, [fallback])
  return src
}
