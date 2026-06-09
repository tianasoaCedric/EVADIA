'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Star, MessageSquare } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useOnScreen } from '@/hooks/useOnScreen'
import Bouton from './Bouton'
import { avisService } from '@/lib/services/avis.service'
import { reservationService } from '@/lib/services/reservation.service'
import type { AvisPublic, Reservation } from '@/lib/types'

interface AvisClientProps {
  hotelId?: number
  title?: string
}

const getInitials = (prenom: string, nom: string): string => {
  return (prenom[0] + nom[0]).toUpperCase()
}

const RatingStars = ({
  rating,
  onRatingChange,
  size = 'md',
}: {
  rating: number
  onRatingChange?: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
}) => {
  const [hoverRating, setHoverRating] = useState(0)
  const isInteractive = !!onRatingChange

  const starSizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }

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
            className={`${starSizes[size]} ${
              (hoverRating || rating) >= star
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } transition-colors duration-200`}
          />
        </button>
      ))}
    </div>
  )
}

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  const starPath =
    'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d={starPath} />
        </svg>
      ))}
      {hasHalfStar && (
        <svg key="half" className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="halfGradient" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
          <path fill="url(#halfGradient)" d={starPath} />
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
          <path d={starPath} />
        </svg>
      ))}
    </div>
  )
}

export default function AvisClient({ hotelId, title }: AvisClientProps) {
  const t = useTranslations('AvisClient')

  const [avisList, setAvisList] = useState<AvisPublic[]>([])
  const [isLoadingAvis, setIsLoadingAvis] = useState(!!hotelId)
  const [visibleAvis, setVisibleAvis] = useState(4)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [eligibleReservations, setEligibleReservations] = useState<Reservation[]>([])
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null)
  const [formRating, setFormRating] = useState(5)
  const [formComment, setFormComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const [setTitleRef, isTitleVisible] = useOnScreen({ threshold: 0.2,  })
  const [setGridRef, isGridVisible] = useOnScreen({ threshold: 0.2,  })
  const [setFormRef, isFormVisible] = useOnScreen({ threshold: 0.2,  })

  useEffect(() => {
    if (!hotelId) return
    avisService
      .listByHotel(hotelId)
      .then((res) => setAvisList(res.data))
      .catch(() => {})
      .finally(() => setIsLoadingAvis(false))
  }, [hotelId])

  const handleOpenForm = async () => {
    if (!isFormOpen && hotelId) {
      try {
        const res = await reservationService.list({ statut: 'terminee' })
        const forThisHotel = res.data.filter(
          (r) => r.hotel_id === hotelId || r.propriete?.hotel?.id === hotelId
        )
        setEligibleReservations(forThisHotel)
        if (forThisHotel.length > 0) setSelectedReservationId(forThisHotel[0].id)
      } catch {
        setEligibleReservations([])
      }
    }
    setIsFormOpen(!isFormOpen)
    setSubmitError('')
    setSubmitSuccess(false)
  }

  const handleSubmit = async () => {
    if (!selectedReservationId || !formComment.trim()) return
    setIsSubmitting(true)
    setSubmitError('')
    try {
      const res = await avisService.create({
        reservation_id: selectedReservationId,
        note: formRating,
        commentaire: formComment,
      })
      // Optimistic: prepend the new avis fetched from API
      const created = res.data
      const newAvis: AvisPublic = {
        id: created.id,
        note: created.note,
        commentaire: created.commentaire,
        date_avis: created.created_at,
      }
      setAvisList((prev) => [newAvis, ...prev])
      setFormComment('')
      setFormRating(5)
      setIsFormOpen(false)
      setSubmitSuccess(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('submit_error')
      setSubmitError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayTitle = title || t('default_title')

  return (
    <div className="w-full">
      {/* Titre */}
      <div
        ref={setTitleRef}
        className={`transition-all duration-700 ease-out ${isTitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-medium text-gray-800">{displayTitle}</h2>
          {hotelId && (
            <button
              onClick={handleOpenForm}
              className="px-4 py-2 rounded-full bg-[#01BDA5] text-white hover:bg-[#01A38E] transition-all duration-200 cursor-pointer text-sm font-medium"
            >
              {isFormOpen ? t('cancel') : t('write_review')}
            </button>
          )}
        </div>
      </div>

      {/* Message succès */}
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm">
          {t('submit_success')}
        </div>
      )}

      {/* Formulaire */}
      {isFormOpen && (
        <div
          ref={setFormRef}
          className={`mb-8 p-6 border border-gray-200 rounded-2xl transition-all duration-700 ease-out ${isFormVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('write_review_title')}</h3>

          {eligibleReservations.length === 0 ? (
            <div className="flex items-center gap-3 text-gray-500 text-sm py-4">
              <MessageSquare className="w-5 h-5 flex-shrink-0" />
              <p>{t('no_eligible_reservation')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sélection réservation si plusieurs */}
              {eligibleReservations.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('select_reservation')}
                  </label>
                  <select
                    value={selectedReservationId ?? ''}
                    onChange={(e) => setSelectedReservationId(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F5F5F5] text-sm font-medium focus:outline-none"
                  >
                    {eligibleReservations.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.date_debut} → {r.date_fin}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('rating_label')}</label>
                <RatingStars rating={formRating} onRatingChange={setFormRating} size="lg" />
              </div>

              {/* Commentaire */}
              <textarea
                placeholder={t('review_placeholder')}
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5F5] font-sans font-medium text-sm placeholder:text-gray-800 hover:bg-[#E8E8E8] focus:outline-none resize-none"
              />

              {submitError && (
                <p className="text-sm text-red-600">{submitError}</p>
              )}

              <Bouton
                variant="primary"
                size="medium"
                widthMode="full"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={!selectedReservationId || !formComment.trim()}
              >
                {t('submit_button')}
              </Bouton>
            </div>
          )}
        </div>
      )}

      {/* Liste des avis */}
      <div
        ref={setGridRef}
        className={`transition-all duration-700 ease-out ${isGridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        {isLoadingAvis ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : avisList.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">{t('no_reviews')}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {avisList.slice(0, visibleAvis).map((avisItem, index) => (
                <div
                  key={avisItem.id}
                  className="rounded-2xl p-5 transition-all duration-500 ease-out"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {avisItem.client?.photo_profil ? (
                        <Image
                          src={avisItem.client.photo_profil}
                          alt={`${avisItem.client.prenom} ${avisItem.client.nom}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#01BDA5]/20 text-[#01BDA5] font-bold text-lg">
                          {avisItem.client
                            ? getInitials(avisItem.client.prenom, avisItem.client.nom)
                            : '?'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {avisItem.client
                          ? `${avisItem.client.prenom} ${avisItem.client.nom}`
                          : t('anonymous')}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(avisItem.note)}
                        <span className="text-sm text-gray-500">{avisItem.note.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed">{avisItem.commentaire}</p>

                  {avisItem.reponse_hotel && (
                    <div className="mt-3 pl-3 border-l-2 border-[#01BDA5]">
                      <p className="text-xs font-medium text-[#01BDA5] mb-1">{t('hotel_reply')}</p>
                      <p className="text-gray-600 text-sm leading-relaxed">{avisItem.reponse_hotel}</p>
                    </div>
                  )}

                  {avisItem.date_avis && (
                    <p className="text-xs text-gray-400 mt-3">
                      {new Date(avisItem.date_avis).toLocaleDateString('fr-FR', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {visibleAvis < avisList.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setVisibleAvis((prev) => prev + 4)}
                  className="px-6 py-2 rounded-full border border-[#01BDA5] text-[#01BDA5] hover:bg-[#01BDA5] hover:text-white transition-all duration-200 cursor-pointer"
                >
                  {t('show_more')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
