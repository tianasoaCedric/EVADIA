'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Share, Heart } from 'lucide-react'
import {
  Wifi, Snowflake, Tv, Bath, Coffee, Utensils, Wind, Bed,
  Lock, Key, Bell, Phone, Droplets, Briefcase, Thermometer,
  Flame, Waves, Mountain, Trees, Star, ShowerHead
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useOnScreen } from '@/hooks/useOnScreen'
import Bouton from '../../components/ui/Bouton'
import HotelPhoto from '../../components/ui/HotelPhoto'
import Reservation from '../../components/ui/Reservation'
import HotelInfo from '../../components/ui/HotelInfo'
import SharePopup from '../../components/ui/SharePopup'
import { proprieteService } from '@/lib/services/propriete.service'
import { reservationService } from '@/lib/services/reservation.service'
import { authService } from '@/lib/services/auth.service'
import type { ProprietePublic } from '@/lib/types'
import Loading from '../../components/ui/Loading'

interface ProprieteClientProps {
  proprieteId: number
  proprieteName: string
  slug: string
}

function getEquipementIcon(icone?: string) {
  const map: Record<string, React.ReactNode> = {
    wifi: <Wifi className="w-5 h-5" />,
    snowflake: <Snowflake className="w-5 h-5" />,
    tv: <Tv className="w-5 h-5" />,
    bath: <Bath className="w-5 h-5" />,
    coffee: <Coffee className="w-5 h-5" />,
    utensils: <Utensils className="w-5 h-5" />,
    wind: <Wind className="w-5 h-5" />,
    bed: <Bed className="w-5 h-5" />,
    lock: <Lock className="w-5 h-5" />,
    key: <Key className="w-5 h-5" />,
    bell: <Bell className="w-5 h-5" />,
    phone: <Phone className="w-5 h-5" />,
    droplets: <Droplets className="w-5 h-5" />,
    briefcase: <Briefcase className="w-5 h-5" />,
    thermometer: <Thermometer className="w-5 h-5" />,
    flame: <Flame className="w-5 h-5" />,
    waves: <Waves className="w-5 h-5" />,
    mountain: <Mountain className="w-5 h-5" />,
    trees: <Trees className="w-5 h-5" />,
    'shower-head': <ShowerHead className="w-5 h-5" />,
  }
  return map[icone ?? ''] ?? <Star className="w-5 h-5" />
}

export default function ProprieteClient({ proprieteId, proprieteName, slug }: ProprieteClientProps) {
  const router = useRouter()
  const t = useTranslations('ProprieteClient')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [propriete, setPropriete] = useState<ProprietePublic | null>(null)
  const [bookedDates, setBookedDates] = useState<string[]>([])
  const [isShareOpen, setIsShareOpen] = useState(false)

  const [setMainRef, isMainVisible] = useOnScreen({ threshold: 0.2,  })

  useEffect(() => {
    const fetchPropriete = async () => {
      setIsLoading(true)
      try {
        const [data, dates] = await Promise.all([
          proprieteService.get(proprieteId),
          proprieteService.getBookedDates(proprieteId),
        ])
        setPropriete(data)
        setBookedDates(dates)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPropriete()
  }, [proprieteId])

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  const handleShare = () => {
    setIsShareOpen(true)
  }

  const handleReservation = async (data: any) => {
    if (!authService.isAuthenticated()) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    setIsSubmitting(true)
    try {
      const fmt = (d: Date) => d.toISOString().split('T')[0]
      await reservationService.create({
        propriete_id: proprieteId,
        date_debut: fmt(data.checkIn),
        date_fin: fmt(data.checkOut),
        nb_adultes: data.guests,
      })
      router.push('/reservations')
    } catch (error) {
      console.error(t('reservation_log'), error)
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

  if (!propriete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">{t('not_found')}</div>
      </div>
    )
  }

  const photos = propriete.photos.map(p => p.url_photo)
  const location = propriete.hotel.adresse
    ? `${propriete.hotel.adresse.ville}, ${propriete.hotel.adresse.pays}`
    : 'Madagascar'
  const equipements = propriete.equipements.map(e => ({
    id: e.id,
    name: e.nom,
    icon: getEquipementIcon(e.icone),
  }))

  return (
    <>
        <main
      ref={setMainRef}
      className={`min-h-screen pt-24 pb-16 transition-all duration-700 ease-out ${
        isMainVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="flex flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-full transition-colors cursor-pointer"
              aria-label={t('back_label')}
            >
              <ChevronLeft className="w-8 h-8 text-gray-600 hover:text-[#01BDA5] transition-colors" />
            </button>
            <h1 className="text-xl md:text-3xl lg:text-4xl font-medium text-gray-800">
              {propriete.nom}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Bouton size="medium" onClick={handleShare} className="flex items-center gap-2">
              <Share className="w-5 h-5" />
              <span className="hidden sm:inline">{t('share')}</span>
            </Bouton>
          </div>
        </div>

        {/* Photos */}
        <div className="py-4">
          <HotelPhoto
            imageUrl={photos.length > 0 ? photos : ['/photos/bc.png']}
            autoPlayInterval={5000}
            className="mb-4"
          />
        </div>

        {/* Infos + Réservation */}
        <div className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

            {/* Colonne gauche : détails */}
            <div>
              <HotelInfo
                hotelName={propriete.nom}
                location={location}
                rating={0}
                reviewCount={0}
                category={propriete.type_propriete}
                description={propriete.description ?? ''}
                beds={propriete.nb_lits}
                bathrooms={propriete.nb_salles_bain}
                maxPersons={propriete.capacite}
                equipments={equipements.length > 0 ? equipements : undefined}
                layout="rows"
              />
            </div>

            {/* Colonne droite : réservation */}
            <div className="lg:sticky lg:top-24">
              <Reservation
                pricePerNight={propriete.prix_par_nuit ?? 0}
                prixMga={propriete.prix_mga}
                prixEur={propriete.prix_eur}
                discountPercent={0}
                serviceFees={0}
                roomName={propriete.nom}
                bookedDates={bookedDates}
                onReserve={handleReservation}
              />
            </div>
          </div>
        </div>
      </div>

      
    </main>
  {/* Popup de partage */}
      <SharePopup
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={propriete.nom}
        text={t('share_text', { name: propriete.nom })}
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />
    </>
  )
}