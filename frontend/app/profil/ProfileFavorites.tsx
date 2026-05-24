'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import CardHotel from '../components/ui/CardHotel'
import { favoriService } from '@/lib/services'
import type { Favori } from '@/lib/types'
import Loading from '../components/ui/Loading'

export default function ProfileFavorites() {
  const t = useTranslations('ProfileFavorites')
  const [favorites, setFavorites] = useState<Favori[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    favoriService.list()
      .then(res => setFavorites(res.data))
      .catch(() => setFavorites([]))
      .finally(() => setIsLoading(false))
  }, [])

  const handleRemoveFavorite = (hotelId: number) => {
    setFavorites(prev => prev.filter(f => f.hotel_id !== hotelId))
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex justify-center py-12">
        <Loading />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-[#01BDA5]" />
          <h2 className="text-xl font-semibold text-gray-800">{t('title')}</h2>
        </div>
        <Link href="/favorite" className="text-[#01BDA5] text-sm font-medium hover:underline">
          {t('view_all')}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {favorites.slice(0, 4).map((favori) => (
          <CardHotel
            key={favori.id}
            imageUrl={favori.hotel.photo_principale ?? ''}
            name={favori.hotel.nom}
            hotelId={favori.hotel_id}
            availability="Disponible"
            price={favori.hotel.prix_min ?? 0}
            prixMga={favori.hotel.prix_min_mga}
            prixEur={favori.hotel.prix_min_eur}
            rating={favori.hotel.note_moyenne ?? 0}
            initialIsFavorite={true}
            onFavoriteToggle={(isFavorite) => {
              if (!isFavorite) handleRemoveFavorite(favori.hotel_id)
            }}
          />
        ))}
      </div>

      {favorites.length === 0 && (
        <div className="text-center py-8">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{t('no_favorites')}</p>
          <Link
            href="/hebergement"
            className="inline-block mt-3 text-[#01BDA5] text-sm font-medium hover:underline"
          >
            {t('discover_hotels')}
          </Link>
        </div>
      )}
    </div>
  )
}
