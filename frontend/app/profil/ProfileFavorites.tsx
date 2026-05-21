'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import CardHotel from '../components/ui/CardHotel'

// Données mock
const mockFavorites = [
  {
    id: 1,
    imageUrl: '/photos/hotels/ecolodge-1.jpg',
    name: 'Ecolodge de la Forêt',
    availability: 'Disponible',
    price: 85000,
    rating: 4.5,
    reviewCount: 128,
  },
  {
    id: 2,
    imageUrl: '/photos/hotels/villa-1.jpg',
    name: 'Villa de Rêve',
    availability: 'Disponible',
    price: 250000,
    rating: 4.9,
    reviewCount: 234,
  },
  {
    id: 3,
    imageUrl: '/photos/hotels/luxe-1.jpg',
    name: 'Palace Hôtel',
    availability: 'Disponible',
    price: 450000,
    rating: 4.9,
    reviewCount: 342,
  },
]

export default function ProfileFavorites() {
  const t = useTranslations('ProfileFavorites')
  const [favorites, setFavorites] = useState(mockFavorites)

  const handleRemoveFavorite = (hotelId: number) => {
    setFavorites(favorites.filter(h => h.id !== hotelId))
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
        {favorites.slice(0, 4).map((hotel) => (
          <CardHotel
            key={hotel.id}
            imageUrl={hotel.imageUrl}
            name={hotel.name}
            hotelId={hotel.id}
            availability={hotel.availability}
            price={hotel.price}
            rating={hotel.rating}
            reviewCount={hotel.reviewCount}
            onFavoriteToggle={(isFavorite) => {
              if (!isFavorite) handleRemoveFavorite(hotel.id)
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