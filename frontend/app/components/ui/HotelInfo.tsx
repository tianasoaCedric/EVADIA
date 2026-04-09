'use client'

import { useState } from 'react'
import { MapPin, Star, Wifi, ParkingMeter, Snowflake, Tv, Bath, Coffee, Utensils, Dumbbell, Check, Bell } from 'lucide-react'

interface HotelInfoProps {
  hotelName: string
  location: string
  rating: number
  reviewCount: number
  category: string
  description: string
  includedItems?: string[]
  equipments?: Equipment[]
}

interface Equipment {
  id: number
  name: string
  icon: React.ReactNode
}

const defaultEquipments: Equipment[] = [
  { id: 1, name: 'Wi-Fi gratuit', icon: <Wifi className="w-5 h-5" /> },
  { id: 2, name: 'Parking gratuit', icon: <ParkingMeter className="w-5 h-5" /> },
  { id: 3, name: 'Climatisation', icon: <Snowflake className="w-5 h-5" /> },
  { id: 4, name: 'Télévision', icon: <Tv className="w-5 h-5" /> },
  { id: 5, name: 'Salle de bain privée', icon: <Bath className="w-5 h-5" /> },
  { id: 6, name: 'Petit-déjeuner', icon: <Coffee className="w-5 h-5" /> },
  { id: 7, name: 'Restaurant', icon: <Utensils className="w-5 h-5" /> },
  { id: 8, name: 'Salle de sport', icon: <Dumbbell className="w-5 h-5" /> },
  { id: 9, name: 'Service de chambre', icon: <Bell className="w-5 h-5" /> },
]

const defaultIncluded = [
  'Wi-Fi haut débit',
  'Serviettes de bain',
  'Gel douche et shampooing',
  'Sèche-cheveux',
  'Machine à café',
  'Eau minérale offerte'
]

export default function HotelInfo({ 
  hotelName,
  location,
  rating,
  reviewCount,
  category,
  description,
  includedItems = defaultIncluded,
  equipments = defaultEquipments
}: HotelInfoProps) {
  const [showAllEquipments, setShowAllEquipments] = useState(false)
  const displayedEquipments = showAllEquipments ? equipments : equipments.slice(0, 8)

  const renderStars = () => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-32 justify-start">
      {/* Colonne 1 : Informations de l'hôtel */}
      <div className='h-full flex flex-col justify-between'>
      <div className="space-y-6">
        {/* Localisation + avis */}
        <div>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <MapPin className="w-5 h-5 text-[#01BDA5]" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-3">
            {renderStars()}
            <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({reviewCount} avis)</span>
          </div>
        </div>

        {/* Catégorie */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Catégorie</h3>
          <p className="text-gray-800">{category}</p>
        </div>

        {/* À propos */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">À propos</h3>
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      </div>

      {/* Colonne 2 : Inclus et Équipements */}
      <div className='h-full flex flex-col justify-between'>
      <div className="space-y-8">
        {/* Inclus dans le logement */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Inclus dans le logement</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {includedItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#01BDA5] flex-shrink-0" />
                <span className="text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Équipements */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Équipements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayedEquipments.map((equipment) => (
              <div key={equipment.id} className="flex items-center gap-3">
                <div className="text-[#01BDA5] flex-shrink-0">
                  {equipment.icon}
                </div>
                <span className="text-gray-600">{equipment.name}</span>
              </div>
            ))}
          </div>
          
          {/* Bouton Afficher tout les équipements */}
          {equipments.length > 8 && (
            <button
              onClick={() => setShowAllEquipments(!showAllEquipments)}
              className="mt-4 text-[#01BDA5] text-sm font-medium hover:underline transition-all cursor-pointer"
            >
              {showAllEquipments ? 'Voir moins' : 'Afficher tout les équipements'}
            </button>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}