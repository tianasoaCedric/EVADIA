'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { favoriService } from '@/lib/services'
import { onAuthChanged } from '@/lib/auth-events'

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
    // Rechargé à chaque connexion / déconnexion : un visiteur n'a aucun favori
    const load = () => {
      favoriService.list()
        .then(res => setFavoriteIds(new Set(res.data.map(f => f.hotel_id))))
        .catch(() => setFavoriteIds(new Set()))
    }
    load()
    return onAuthChanged(load)
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
