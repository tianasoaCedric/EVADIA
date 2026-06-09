'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, Star, Wifi, ParkingMeter, Snowflake, Tv, Bath, Coffee, Utensils, Dumbbell, Check, Bell, Bed, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useOnScreen } from '@/hooks/useOnScreen'

interface HotelInfoProps {
  hotelName: string
  location: string
  etoiles?: number
  rating: number
  reviewCount: number
  category: string
  description: string
  beds?: number
  bathrooms?: number
  maxPersons?: number
  includedItems?: string[]
  equipments?: Equipment[]
  layout?: 'columns' | 'rows'
}

interface Equipment {
  id: number
  name: string
  icon: React.ReactNode
}

const defaultEquipments: Equipment[] = []

const defaultIncluded: string[] = []

export default function HotelInfo({
  hotelName,
  location,
  etoiles,
  rating,
  reviewCount,
  category,
  description,
  beds,
  bathrooms,
  maxPersons,
  includedItems = defaultIncluded,
  equipments = defaultEquipments,
  layout = 'columns'
}: HotelInfoProps) {
  const t = useTranslations('HotelInfo')
  const [showAllEquipments, setShowAllEquipments] = useState(false)
  const displayedEquipments = showAllEquipments ? equipments : equipments.slice(0, 8)

  // Refs pour chaque section
  const [setLocationRef, isLocationVisible] = useOnScreen({ threshold: 0.2,  })
  const [setCategoryRef, isCategoryVisible] = useOnScreen({ threshold: 0.2,  })
  const [setAboutRef, isAboutVisible] = useOnScreen({ threshold: 0.2,  })
  const [setFeaturesRef, isFeaturesVisible] = useOnScreen({ threshold: 0.2,  })
  const [setIncludedRef, isIncludedVisible] = useOnScreen({ threshold: 0.2,  })
  const [setEquipmentsRef, isEquipmentsVisible] = useOnScreen({ threshold: 0.2,  })

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

  // Composant des caractéristiques (lits, sdb, personnes)
  const FeaturesSection = () => (
    <div className="flex items-center gap-6">
      {beds !== undefined && (
        <div className="flex items-center gap-2">
          <Bed className="w-5 h-5 text-[#01BDA5]" />
          <div className='flex items-center gap-3'>
            <p className="text-xs text-gray-500">{t('beds_label')} :</p>
            <p className="text-xl font-bold text-gray-800">{beds}</p>
          </div>
        </div>
      )}
      {bathrooms !== undefined && (
        <div className="flex items-center gap-2">
          <Bath className="w-5 h-5 text-[#01BDA5]" />
          <div className='flex items-center gap-3'>
            <p className="text-xs text-gray-500">{t('bathrooms_label')} :</p>
            <p className="text-xl font-bold text-gray-800">{bathrooms}</p>
          </div>
        </div>
      )}
      {maxPersons !== undefined && (
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#01BDA5]" />
          <div className='flex items-center gap-3'>
            <p className="text-xs text-gray-500">{t('persons_label')} :</p>
            <p className="text-xl font-bold text-gray-800">{maxPersons}</p>
          </div>
        </div>
      )}
    </div>
  )

  // Layout en colonnes (pour la page hôtel)
  if (layout === 'columns') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-32 justify-start">
        {/* Colonne 1 : Informations de l'hôtel */}
        <div className='h-full flex flex-col justify-between'>
          <div className="space-y-6">
            {/* Localisation + avis */}
            <div
              ref={setLocationRef}
              className={`transition-all duration-700 ease-out ${
                isLocationVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin className="w-5 h-5 text-[#01BDA5]" />
                <span>{location}</span>
              </div>
              {etoiles !== undefined && etoiles > 0 && (
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(etoiles)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">{t('official_classification')}</span>
                </div>
              )}
              {rating > 0 && (
                <div className="flex items-center gap-3">
                  {renderStars()}
                  <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({reviewCount} {t('reviews')})</span>
                </div>
              )}
            </div>

            {/* Catégorie */}
            <div
              ref={setCategoryRef}
              className={`transition-all duration-700 ease-out ${
                isCategoryVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('category_label')}</h3>
              <p className="text-gray-800">{category}</p>
            </div>

            {/* À propos */}
            <div
              ref={setAboutRef}
              className={`transition-all duration-700 ease-out ${
                isAboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('about_label')}</h3>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>

            {/* Caractéristiques (lits, sdb, personnes) */}
            {(beds !== undefined || bathrooms !== undefined || maxPersons !== undefined) && (
              <div
                ref={setFeaturesRef}
                className={`transition-all duration-700 ease-out ${
                  isFeaturesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('features_label')}</h3>
                <FeaturesSection />
              </div>
            )}
          </div>
        </div>

        {/* Colonne 2 : Inclus et Équipements */}
        <div className='h-full flex flex-col justify-between'>
          <div className="space-y-8">
            {/* Inclus dans le logement */}
            {includedItems.length > 0 && (
            <div
              ref={setIncludedRef}
              className={`transition-all duration-700 ease-out ${
                isIncludedVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('included_label')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {includedItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-[#01BDA5] flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Équipements */}
            <div
              ref={setEquipmentsRef}
              className={`transition-all duration-700 ease-out ${
                isEquipmentsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('equipments_label')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayedEquipments.map((equipment, index) => (
                  <div 
                    key={equipment.id} 
                    className={`flex items-center gap-3 transition-all duration-500 ease-out`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="text-[#01BDA5] flex-shrink-0">{equipment.icon}</div>
                    <span className="text-gray-600">{equipment.name}</span>
                  </div>
                ))}
              </div>
              {equipments.length > 8 && (
                <button
                  onClick={() => setShowAllEquipments(!showAllEquipments)}
                  className="mt-4 text-[#01BDA5] text-sm font-medium hover:underline transition-all cursor-pointer"
                >
                  {showAllEquipments ? t('see_less') : t('see_all')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Layout en lignes (pour la page chambre)
  return (
    <div className="space-y-8">
      {/* Ligne 1 : Informations de base */}
      <div className="space-y-4">
        <div
          ref={setLocationRef}
          className={`transition-all duration-700 ease-out ${
            isLocationVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <MapPin className="w-5 h-5 text-[#01BDA5]" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-3">
            {renderStars()}
            <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({reviewCount} {t('reviews')})</span>
          </div>
        </div>

        <div
          ref={setCategoryRef}
          className={`transition-all duration-700 ease-out ${
            isCategoryVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h3 className="text-sm font-medium text-gray-500 mb-1">{t('category_label')}</h3>
          <p className="text-gray-800">{category}</p>
        </div>

        {/* Caractéristiques (lits, sdb, personnes) */}
        {(beds !== undefined || bathrooms !== undefined || maxPersons !== undefined) && (
          <div
            ref={setFeaturesRef}
            className={`transition-all duration-700 ease-out ${
              isFeaturesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('features_label')}</h3>
            <FeaturesSection />
          </div>
        )}
      </div>

      {/* Ligne 2 : À propos */}
      <div
        ref={setAboutRef}
        className={`transition-all duration-700 ease-out ${
          isAboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('about_label')}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>

      {/* Ligne 3 : Inclus dans le logement */}
      {includedItems.length > 0 && (
      <div
        ref={setIncludedRef}
        className={`transition-all duration-700 ease-out ${
          isIncludedVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('included_label')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {includedItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[#01BDA5] flex-shrink-0" />
              <span className="text-gray-600">{item}</span>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Ligne 4 : Équipements */}
      <div
        ref={setEquipmentsRef}
        className={`transition-all duration-700 ease-out ${
          isEquipmentsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('equipments_label')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedEquipments.map((equipment, index) => (
            <div 
              key={equipment.id} 
              className="flex items-center gap-3 transition-all duration-500 ease-out"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="text-[#01BDA5] flex-shrink-0">{equipment.icon}</div>
              <span className="text-gray-600">{equipment.name}</span>
            </div>
          ))}
        </div>
        {equipments.length > 8 && (
          <button
            onClick={() => setShowAllEquipments(!showAllEquipments)}
            className="mt-4 text-[#01BDA5] text-sm font-medium hover:underline transition-all cursor-pointer"
          >
            {showAllEquipments ? t('see_less') : t('see_all')}
          </button>
        )}
      </div>
    </div>
  )
}