'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'

interface Avis {
  id: number
  userName: string
  userPhoto?: string
  rating: number
  comment: string
  date?: string
}

interface AvisClientProps {
  avis?: Avis[]
  title?: string
}

const defaultAvis: Avis[] = [
  {
    id: 1,
    userName: 'Sophie Martine',
    userPhoto: '',
    rating: 5,
    comment: 'Villa absolument magnifique avec une vue spectaculaire sur l\'océan. L\'hôte était très accueillant et a rendu notre séjour inoubliable. La piscine privée et les équipements de luxe ont dépassé nos attentes.',
    date: 'Mars 2026'
  },
  {
    id: 2,
    userName: 'Thomas Dupont',
    userPhoto: '',
    rating: 4.5,
    comment: 'Très belle expérience, chambre confortable et personnel attentionné. Le petit déjeuner était excellent. Je recommande vivement cet établissement.',
    date: 'Février 2026'
  },
  {
    id: 3,
    userName: 'Marie Lambert',
    userPhoto: '/photos/test.jpg',
    rating: 5,
    comment: 'Un séjour parfait ! L\'emplacement est idéal, proche de toutes les commodités. La chambre était spacieuse et très propre. Le personnel est aux petits soins.',
    date: 'Janvier 2026'
  },
  {
    id: 4,
    userName: 'David Moreau',
    userPhoto: '',
    rating: 4,
    comment: 'Très bon rapport qualité-prix. L\'hôtel est bien situé et les chambres sont confortables. Seul petit bémol : le bruit de la rue.',
    date: 'Décembre 2025'
  }
]

// Fonction pour récupérer les initiales d'un nom
const getInitials = (name: string): string => {
  const nameParts = name.trim().split(' ')
  if (nameParts.length >= 2) {
    return (nameParts[0][0] + nameParts[1][0]).toUpperCase()
  }
  return nameParts[0][0].toUpperCase()
}

export default function AvisClient({ avis = defaultAvis, title = "Avis des voyageurs" }: AvisClientProps) {
  const [visibleAvis, setVisibleAvis] = useState(4)

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <svg
            key={`full-${i}`}
            className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg
            key="half"
            className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <defs>
              <linearGradient id="halfGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#e5e7eb" />
              </linearGradient>
            </defs>
            <path
              fill="url(#halfGradient)"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg
            key={`empty-${i}`}
            className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  const loadMore = () => {
    setVisibleAvis(prev => prev + 4)
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl md:text-3xl font-medium text-gray-800 mb-8">
        {title}
      </h2>

      {/* Grille d'avis - 2 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
        {avis.slice(0, visibleAvis).map((avisItem) => (
          <div
            key={avisItem.id}
            className="rounded-2xl p-5 "
          >
            {/* En-tête : photo + nom */}
            <div className="flex items-center gap-3 mb-3">
              {/* Photo de profil ou initiales */}
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {avisItem.userPhoto ? (
                  <Image
                    src={avisItem.userPhoto}
                    alt={avisItem.userName}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Si l'image ne charge pas, afficher les initiales
                      const target = e.target as HTMLElement;
                      target.parentElement?.classList.add('hide-image');
                    }}
                  />
                ) : null}
                {/* Initiales affichées si pas de photo ou si l'image a échoué */}
                <div className={`w-full h-full flex items-center justify-center bg-[#01BDA5]/20 text-[#01BDA5] font-bold text-lg ${avisItem.userPhoto ? 'hide-image' : ''}`}>
                  {getInitials(avisItem.userName)}
                </div>
              </div>
              
              {/* Nom et étoiles */}
              <div>
                <h3 className="font-semibold text-gray-800">
                  {avisItem.userName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {renderStars(avisItem.rating)}
                  <span className="text-sm text-gray-500">{avisItem.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Commentaire */}
            <p className="text-gray-600 text-sm leading-relaxed">
              {avisItem.comment}
            </p>

            {/* Date (optionnelle) */}
            {avisItem.date && (
              <p className="text-xs text-gray-400 mt-3">
                {avisItem.date}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Bouton "Afficher plus" */}
      {visibleAvis < avis.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            className="px-6 py-2 rounded-full border border-[#01BDA5] text-[#01BDA5] hover:bg-[#01BDA5] hover:text-white transition-all duration-200 cursor-pointer"
          >
            Afficher plus d'avis
          </button>
        </div>
      )}
    </div>
  )
}