'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { ChevronLeft, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import HeroSection from '../../components/ui/HeroSection'
import Bouton from '../../components/ui/Bouton'
import { useOnScreen } from '@/hooks/useOnScreen'
import type { OffreDetail } from '@/lib/services'
import Loading from '@/app/components/ui/Loading'

interface OfferDetailClientProps {
  offerId: number
  offerName: string
  slug: string
  initialOffer: OffreDetail | null
}

const getMonthName = (monthNum: number, locale: string): string => {
  const date = new Date(2000, monthNum - 1, 1)
  return date.toLocaleDateString(locale, { month: 'long' })
}

export default function OfferDetailClient({ offerId, offerName, slug, initialOffer }: OfferDetailClientProps) {
  const router = useRouter()
  const t = useTranslations('OfferDetailClient')
  const locale = useLocale()

  const [offer] = useState<OffreDetail | null>(initialOffer)
  const [isLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [setMainRef, isMainVisible] = useOnScreen({ threshold: 0.2,  })

  void slug
  void offerId

  const handleReservation = async () => {
    if (!acceptedTerms || !offer) return
    setIsSubmitting(true)
    try {
      // Point de contact : pas de réservation directe, on affiche le succès
      await new Promise((r) => setTimeout(r, 800))
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">{t('not_found')}</div>
      </div>
    )
  }

  const month = getMonthName(offer.month_num, locale)

  return (
    <main className="min-h-screen">
      <HeroSection
        title={t('hero_title', { hotelName: offer.hotel_nom })}
        subtitle={t('hero_subtitle', { discount: offer.discount, destination: offerName })}
        backgroundImage={offer.photo ?? '/photos/chambre.jpg'}
        showDownload={false}
        showScrollIndicator={false}
      />

      <div className="container mx-auto px-4 py-12">
        <div
          ref={setMainRef}
          className={`transition-all duration-700 ease-out ${
            isMainVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Bouton retour */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-[#01BDA5] transition-colors mb-6 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>{t('back_button')}</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Colonne gauche */}
            <div className="space-y-6">
              {/* Badge réduction */}
              <div className="inline-flex items-center gap-2 bg-[#01BDA5] text-white px-4 py-2 rounded-full">
                <span className="font-bold text-xl">{offer.discount}%</span>
                <span className="text-sm">{t('discount_badge')}</span>
              </div>

              {/* Période */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('period_label')}</h3>
                <p className="text-gray-600">
                  {t('period_value', { startDay: offer.start_day, endDay: offer.end_day, month })}
                </p>
              </div>

              {/* Description */}
              {offer.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('description_label')}</h3>
                  <p className="text-gray-600 leading-relaxed">{offer.description}</p>
                </div>
              )}

              {/* Contact */}
              {(offer.phone || offer.email) && (
                <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('contact_label')}</h3>

                  {offer.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-[#01BDA5]" />
                      <div>
                        <p className="text-sm text-gray-500">{t('phone_label')}</p>
                        <a href={`tel:${offer.phone}`} className="text-gray-800 hover:text-[#01BDA5] transition-colors">
                          {offer.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {offer.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[#01BDA5]" />
                      <div>
                        <p className="text-sm text-gray-500">{t('email_label')}</p>
                        <a href={`mailto:${offer.email}`} className="text-gray-800 hover:text-[#01BDA5] transition-colors">
                          {offer.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Acceptation et bouton */}
              {submitted ? (
                <div className="flex items-center gap-2 text-[#01BDA5] font-medium">
                  <CheckCircle className="w-5 h-5" />
                  <span>{t('reservation_success')}</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-[#01BDA5] focus:ring-[#01BDA5] cursor-pointer"
                    />
                    <span className="text-gray-700">{t('accept_terms')}</span>
                  </label>

                  <Bouton
                    variant="primary"
                    size="large"
                    widthMode="full"
                    onClick={handleReservation}
                    disabled={!acceptedTerms || isSubmitting}
                    isLoading={isSubmitting}
                  >
                    {t('reserve_button')}
                  </Bouton>
                </div>
              )}
            </div>

            {/* Colonne droite — termes et conditions */}
            {offer.terms.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[#01BDA5]" />
                  {t('terms_title')}
                </h3>

                <div className="space-y-3">
                  {offer.terms.map((term, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#01BDA5] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 text-sm">{term}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
