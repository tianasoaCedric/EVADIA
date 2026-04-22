'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronLeft, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import HeroSection from '../../components/ui/HeroSection'
import Bouton from '../../components/ui/Bouton'
import { useOnScreen } from '@/hooks/useOnScreen'

interface OfferDetailClientProps {
  offerId: number
  offerName: string
  slug: string
}

// Données mock (à remplacer par appel API)
const getOfferData = (id: number) => {
  const offersData: Record<number, any> = {
    1: {
      id: 1,
      name: 'Paris',
      hotelName: 'Hôtel Le Meurice',
      city: 'Paris',
      discount: 25,
      startDay: 1,
      endDay: 15,
      month: 'juin',
      description: 'Profitez d\'une réduction exceptionnelle de 25% sur votre séjour à l\'Hôtel Le Meurice. Offre valable pour toute réservation de 3 nuits minimum.',
      imageUrl: '/photos/offers/paris.jpg',
      phone: '+33 1 23 45 67 89',
      email: 'reservations@lemeurice.com',
      terms: [
        'Offre valable pour les séjours du 1er au 15 juin 2026',
        'Réservation minimum de 3 nuits',
        'Offre non cumulable avec d\'autres promotions',
        'Annulation gratuite jusqu\'à 7 jours avant l\'arrivée',
        'Supplément pour les jours fériés',
        'Tarif valable pour une chambre double',
        'Petit-déjeuner non inclus',
        'Taxe de séjour en supplément'
      ]
    },
    2: {
      id: 2,
      name: 'Maldives',
      hotelName: 'Maldives Paradise Resort',
      city: 'Malé',
      discount: 40,
      startDay: 1,
      endDay: 31,
      month: 'août',
      description: 'Partez pour les Maldives avec une réduction de 40% sur votre séjour. Offre incluant le petit-déjeuner et le transfert aéroport.',
      imageUrl: '/photos/offers/maldives.jpg',
      phone: '+960 123 4567',
      email: 'reservations@maldivesparadise.com',
      terms: [
        'Offre valable pour les séjours du 1er au 31 août 2026',
        'Réservation minimum de 5 nuits',
        'Offre non remboursable',
        'Transfert aéroport inclus',
        'Petit-déjeuner inclus',
        'Supplément pour les repas supplémentaires',
        'Taxe de séjour en supplément'
      ]
    }
  }
  return offersData[id] || null
}

export default function OfferDetailClient({ offerId, offerName, slug }: OfferDetailClientProps) {
  const router = useRouter()
  const t = useTranslations('OfferDetailClient')
  const [offer, setOffer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [setMainRef, isMainVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })

  useEffect(() => {
    const fetchOffer = async () => {
      setIsLoading(true)
      try {
        const data = getOfferData(offerId)
        setOffer(data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOffer()
  }, [offerId])

  const handleReservation = () => {
    if (!acceptedTerms) return
    setIsSubmitting(true)
    // Logique de réservation
    setTimeout(() => {
      setIsSubmitting(false)
      alert(t('reservation_success'))
    }, 1500)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">{t('loading')}</div>
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

  return (
    <main className="min-h-screen">
      {/* HeroSection */}
      <HeroSection
        title={t('hero_title', { hotelName: offer.hotelName })}
        subtitle={t('hero_subtitle', { discount: offer.discount, destination: offerName })}
        backgroundImage={offer.imageUrl}
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

          {/* Grille 2 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Colonne gauche - Informations de l'offre */}
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
                  {t('period_value', { 
                    startDay: offer.startDay, 
                    endDay: offer.endDay, 
                    month: offer.month 
                  })}
                </p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('description_label')}</h3>
                <p className="text-gray-600 leading-relaxed">{offer.description}</p>
              </div>

              {/* Informations de contact */}
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('contact_label')}</h3>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#01BDA5]" />
                  <div>
                    <p className="text-sm text-gray-500">{t('phone_label')}</p>
                    <a href={`tel:${offer.phone}`} className="text-gray-800 hover:text-[#01BDA5] transition-colors">
                      {offer.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#01BDA5]" />
                  <div>
                    <p className="text-sm text-gray-500">{t('email_label')}</p>
                    <a href={`mailto:${offer.email}`} className="text-gray-800 hover:text-[#01BDA5] transition-colors">
                      {offer.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Acceptation des termes */}
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
            </div>

            {/* Colonne droite - Termes et conditions */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#01BDA5]" />
                {t('terms_title')}
              </h3>
              
              <div className="space-y-3">
                {offer.terms.map((term: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#01BDA5] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{term}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}