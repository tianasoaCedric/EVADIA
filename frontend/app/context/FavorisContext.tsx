'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { favoriService } from '@/lib/services'

interface FavorisContextValue {
  favoriteIds: Set<number>
  toggle: (hotelId: number, newState: boolean) => void
}

const FavorisContext = createContext<FavorisContextValue>({
  favoriteIds: new Set(),
  toggle: () => {},
})

export function FavorisProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    favoriService.list()
      .then(res => setFavoriteIds(new Set(res.data.map(f => f.hotel_id))))
      .catch(() => {})
  }, [])

  const toggle = useCallback((hotelId: number, newState: boolean) => {
    setFavoriteIds(prev => {
      const next = new Set(prev)
      if (newState) next.add(hotelId)
      else next.delete(hotelId)
      return next
    })
  }, [])

  return (
    <FavorisContext.Provider value={{ favoriteIds, toggle }}>
      {children}
    </FavorisContext.Provider>
  )
}

export function useFavoris() {
  return useContext(FavorisContext)
}
