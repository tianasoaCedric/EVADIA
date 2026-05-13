'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, User, Mail, MessageSquare } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useOnScreen } from '@/hooks/useOnScreen'
import Input from './Input'
import Bouton from './Bouton'

interface Avis {
  id: number
  userName: string
  userEmail: string
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
    userEmail: 'sophie@example.com',
    userPhoto: '',
    rating: 5,
    comment: 'Villa absolument magnifique avec une vue spectaculaire sur l\'océan. L\'hôte était très accueillant et a rendu notre séjour inoubliable. La piscine privée et les équipements de luxe ont dépassé nos attentes.',
    date: 'Mars 2026'
  },
  {
    id: 2,
    userName: 'Thomas Dupont',
    userEmail: 'thomas@example.com',
    userPhoto: '',
    rating: 4.5,
    comment: 'Très belle expérience, chambre confortable et personnel attentionné. Le petit déjeuner était excellent. Je recommande vivement cet établissement.',
    date: 'Février 2026'
  },
  {
    id: 3,
    userName: 'Marie Lambert',
    userEmail: 'marie@example.com',
    userPhoto: '/photos/test.jpg',
    rating: 5,
    comment: 'Un séjour parfait ! L\'emplacement est idéal, proche de toutes les commodités. La chambre était spacieuse et très propre. Le personnel est aux petits soins.',
    date: 'Janvier 2026'
  },
  {
    id: 4,
    userName: 'David Moreau',
    userEmail: 'david@example.com',
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

// Composant d'étoiles pour la notation
const RatingStars = ({ rating, onRatingChange, size = 'md' }: { rating: number; onRatingChange?: (rating: number) => void; size?: 'sm' | 'md' | 'lg' }) => {
  const [hoverRating, setHoverRating] = useState(0)
  const isInteractive = !!onRatingChange

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange?.(star)}
          onMouseEnter={() => isInteractive && setHoverRating(star)}
          onMouseLeave={() => isInteractive && setHoverRating(0)}
          className={`${isInteractive ? 'cursor-pointer' : 'cursor-default'} transition-transform hover:scale-110`}
          disabled={!isInteractive}
        >
          <Star
            className={`${starSizes[size]} ${(hoverRating || rating) >= star
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
              } transition-colors duration-200`}
          />
        </button>
      ))}
    </div>
  )
}

export default function AvisClient({ avis = defaultAvis, title }: AvisClientProps) {
  const t = useTranslations('AvisClient')
  const [avisList, setAvisList] = useState<Avis[]>(avis)
  const [visibleAvis, setVisibleAvis] = useState(4)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // État du formulaire
  const [formRating, setFormRating] = useState(5)
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formComment, setFormComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Refs pour chaque section
  const [setTitleRef, isTitleVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })
  const [setGridRef, isGridVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })
  const [setFormRef, isFormVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })

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

  const handleSubmit = async () => {
    if (!formName.trim() || !formEmail.trim() || !formComment.trim()) return

    setIsSubmitting(true)

    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newAvis: Avis = {
      id: avisList.length + 1,
      userName: formName,
      userEmail: formEmail,
      rating: formRating,
      comment: formComment,
      date: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    }

    setAvisList([newAvis, ...avisList])
    setFormName('')
    setFormEmail('')
    setFormComment('')
    setFormRating(5)
    setIsFormOpen(false)
    setIsSubmitting(false)
  }

  const displayTitle = title || t('default_title')

  return (
    <div className="w-full">
      {/* Titre avec animation */}
      <div
        ref={setTitleRef}
        className={`transition-all duration-700 ease-out ${isTitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-medium text-gray-800">
            {displayTitle}
          </h2>
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-4 py-2 rounded-full bg-[#01BDA5] text-white hover:bg-[#01A38E] transition-all duration-200 cursor-pointer text-sm font-medium"
          >
            {isFormOpen ? t('cancel') : t('write_review')}
          </button>
        </div>
      </div>
{/* Formulaire d'ajout d'avis */}
{isFormOpen && (
  <div
    ref={setFormRef}
    className={`mb-8 p-6 border border-gray-200 rounded-2xl transition-all duration-700 ease-out ${
      isFormVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}
  >
    <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('write_review_title')}</h3>
    
    <div className="space-y-4">
      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('rating_label')}
        </label>
        <RatingStars rating={formRating} onRatingChange={setFormRating} size="lg" />
      </div>
      
      {/* Nom */}
      <Input
        type="text"
        placeholder={t('name_placeholder')}
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        icon={<User className="w-5 h-5 text-gray-400" />}
        fullWidth
        variant="light"
        placeholderPosition="left"
      />
      
      {/* Email */}
      <Input
        type="email"
        placeholder={t('email_placeholder')}
        value={formEmail}
        onChange={(e) => setFormEmail(e.target.value)}
        icon={<Mail className="w-5 h-5 text-gray-400" />}
        fullWidth
        variant="light"
        placeholderPosition="left"
      />
      
      {/* Avis - style identique aux inputs */}
      <div>
        <textarea
          placeholder={t('review_placeholder')}
          value={formComment}
          onChange={(e) => setFormComment(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-2xl bg-[#F5F5F5] font-sans font-medium text-sm placeholder:text-gray-800 hover:bg-[#E8E8E8] focus:outline-none focus:border-transparent resize-none"
        />
      </div>
      
      {/* Bouton Valider */}
      <Bouton
        variant="primary"
        size="medium"
        widthMode="full"
        onClick={handleSubmit}
        isLoading={isSubmitting}
        disabled={!formName.trim() || !formEmail.trim() || !formComment.trim()}
      >
        {t('submit_button')}
      </Bouton>
    </div>
  </div>
)}
      {/* Grille d'avis - 2 colonnes avec animation */}
      <div
        ref={setGridRef}
        className={`transition-all duration-700 ease-out ${isGridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {avisList.slice(0, visibleAvis).map((avisItem, index) => (
            <div
              key={avisItem.id}
              className={`rounded-2xl p-5 transition-all duration-500 ease-out`}
              style={{ animationDelay: `${index * 50}ms` }}
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
                        const target = e.target as HTMLElement;
                        target.parentElement?.classList.add('hide-image');
                      }}
                    />
                  ) : null}
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
        {visibleAvis < avisList.length && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              className="px-6 py-2 rounded-full border border-[#01BDA5] text-[#01BDA5] hover:bg-[#01BDA5] hover:text-white transition-all duration-200 cursor-pointer"
            >
              {t('show_more')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}