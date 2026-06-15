'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import CardDestination from './components/ui/CardDestination'
import { useOnScreen } from '@/hooks/useOnScreen'
import SpecialOfferCard from './components/ui/SpecialOfferCard'
import SpecialDiscoverCard from './components/ui/SpecialDiscoverCard'
import HeroSection from './components/ui/HeroSection'
import type { VilleDecouverte } from '@/lib/types'
import type { Offre } from '@/lib/services/offre.service'
import type { VillePopulaire } from '@/lib/services/hotel.service'
import { createSlug } from '@/lib/slug'
import Header from './components/molecules/Header'


const BORDER_RADIUS_CYCLE = [
  'rounded-top-left-bottom-right',
  'rounded-all',
  'rounded-top-right-bottom-left',
] as const

const MONTHS_SHORT = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'aoû', 'sep', 'oct', 'nov', 'déc']

interface HomePageProps {
  popularVilles: VillePopulaire[]
  offres: Offre[]
  villes: VilleDecouverte[]
}

export default function HomePage({ popularVilles, offres, villes }: HomePageProps) {
    const t = useTranslations('HomePage')
    const [scrollPosition, setScrollPosition] = useState(0)
    const [activeOfferIndex, setActiveOfferIndex] = useState(1)
    const [activeDiscoverIndex, setActiveDiscoverIndex] = useState(0)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const offerScrollRef = useRef<HTMLDivElement>(null)
    const discoverScrollRef = useRef<HTMLDivElement>(null)

    const [setDestinationsRef, isDestinationsVisible] = useOnScreen({ threshold: 0.2 })
    const [setOffersRef, isOffersVisible] = useOnScreen({ threshold: 0.2 })
    const [setDiscoverRef, isDiscoverVisible] = useOnScreen({ threshold: 0.2 })

    useEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return
        const update = () => setScrollPosition(container.scrollLeft)
        update()
        container.addEventListener('scroll', update)
        window.addEventListener('resize', update)
        return () => {
            container.removeEventListener('scroll', update)
            window.removeEventListener('resize', update)
        }
    }, [])

    useEffect(() => {
        const container = offerScrollRef.current
        if (!container) return
        const handler = () => {
            setActiveOfferIndex(Math.min(Math.round(container.scrollLeft / 310), 2))
        }
        container.addEventListener('scroll', handler)
        return () => container.removeEventListener('scroll', handler)
    }, [])

    useEffect(() => {
        const container = discoverScrollRef.current
        if (!container) return
        const handler = () => {
            setActiveDiscoverIndex(Math.min(Math.round(container.scrollLeft / 310), villes.length - 1))
        }
        container.addEventListener('scroll', handler)
        return () => container.removeEventListener('scroll', handler)
    }, [villes.length])

    const destinations = useMemo(() => popularVilles.map(v => ({
        id: v.id,
        imageUrl: v.image ?? '/photos/bc.png',
        title: v.nom,
        href: `/ville/${createSlug(v.id, v.nom)}`,
    })), [popularVilles])

    const formattedOffers = useMemo(() => {
        return offres.map((o, i) => ({
            id: o.id,
            imageUrl: o.photo ?? '/photos/bc.png',
            discount: o.discount,
            startDay: o.start_day,
            endDay: o.end_day,
            month: MONTHS_SHORT[(o.month_num - 1) % 12] ?? 'jan',
            hotelName: o.hotel_nom,
            city: o.city,
            href: `/offre/${createSlug(o.id, o.titre)}`,
            borderRadius: BORDER_RADIUS_CYCLE[i % 3],
        }))
    }, [offres])

    const activeIndex = Math.min(Math.floor(scrollPosition / 320), Math.max(0, destinations.length - 2))

    const totalDots = Math.max(1, destinations.length - 2)

    const scrollLeft = () => scrollContainerRef.current?.scrollBy({ left: -320, behavior: 'smooth' })
    const scrollRight = () => scrollContainerRef.current?.scrollBy({ left: 320, behavior: 'smooth' })
    const scrollToDot = (i: number) => scrollContainerRef.current?.scrollTo({ left: i * 320, behavior: 'smooth' })
    const scrollToOffer = (i: number) => {
        offerScrollRef.current?.scrollTo({ left: i * 310, behavior: 'smooth' })
        setActiveOfferIndex(i)
    }
    const scrollToDiscover = (i: number) => {
        discoverScrollRef.current?.scrollTo({ left: i * 310, behavior: 'smooth' })
        setActiveDiscoverIndex(i)
    }

    return (
        <>
            <main className="relative min-h-screen">
                <Header />
                <HeroSection
                    title={t('hero_title')}
                    subtitle={t('hero_subtitle')}
                    backgroundImage="/photos/bc.png"
                    videoSrc="/videos/hero.mp4"
                    iosLink="https://apps.apple.com/app/evadia"
                    androidLink="https://play.google.com/store/apps/evadia"
                    showDownload={true}
                    iosText={t('ios')}
                    androidText={t('android')}
                    downloadText={t('download_app')}
                    showScrollIndicator={true}
                />

                {/* Section Destinations Populaires */}
                {destinations.length > 0 && (
                    <section
                        ref={setDestinationsRef}
                        className={`py-4 md:py-4 transition-all duration-700 ease-out overflow-visible ${
                            isDestinationsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }`}
                    >
                        <div className="container mx-auto px-6 overflow-visible">
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-900 mb-2">
                                {t('popular')}
                            </h2>
                            <div className="relative overflow-visible">
                                <button
                                    onClick={scrollLeft}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 mx-2 shadow-md transition-all duration-200 hover:scale-110 hidden md:flex items-center justify-center cursor-pointer"
                                    aria-label="Défiler vers la gauche"
                                >
                                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                                </button>

                                <div
                                    ref={scrollContainerRef}
                                    className="flex overflow-x-auto scroll-smooth gap-6 sm:gap-1 pb-8 scrollbar-hide overflow-visible"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {destinations.map((destination) => (
                                        <div key={destination.id} className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] p-2">
                                            <CardDestination
                                                imageUrl={destination.imageUrl}
                                                title={destination.title}
                                                href={destination.href}
                                                height="h-[411px]"
                                                width="w-72"
                                                hoverEffect="zoom"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={scrollRight}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 mx-2 shadow-md transition-all duration-200 hover:scale-110 hidden md:flex items-center justify-center cursor-pointer"
                                    aria-label="Défiler vers la droite"
                                >
                                    <ChevronRight className="w-6 h-6 text-gray-700" />
                                </button>
                            </div>

                            <div className="flex justify-center gap-2 mt-6 md:hidden">
                                {Array.from({ length: totalDots }).map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => scrollToDot(index)}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                            activeIndex === index ? 'bg-[#01BDA5] w-4' : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                        aria-label={`Aller à la page ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Section Offres Spéciales */}
                {formattedOffers.length > 0 && (
                    <section
                        ref={setOffersRef}
                        className={`py-8 md:py-8 transition-all duration-700 ease-out overflow-visible ${
                            isOffersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }`}
                    >
                        <div className="container mx-auto px-6 overflow-visible">
                            {/* Mobile : carrousel */}
                            <div className="md:hidden overflow-visible">
                                <div
                                    ref={offerScrollRef}
                                    className="overflow-x-auto scroll-smooth pb-6 scrollbar-hide overflow-visible px-2"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    <div className="flex gap-6 px-2">
                                        {formattedOffers.map((offer, index) => (
                                            <div key={offer.id} className="flex-shrink-0 w-[280px] p-2">
                                                {index === 1 ? (
                                                    <div>
                                                        <div className="text-center mb-4">
                                                            <h2 className="text-2xl font-bold text-gray-900">{t('offer')}</h2>
                                                            <Link href="/offre" className="text-gray-600 hover:underline text-sm">{t('see_offer')}</Link>
                                                        </div>
                                                        <SpecialOfferCard
                                                            imageUrl={offer.imageUrl}
                                                            discount={offer.discount}
                                                            startDay={offer.startDay}
                                                            endDay={offer.endDay}
                                                            month={offer.month}
                                                            hotelName={offer.hotelName}
                                                            city={offer.city}
                                                            borderRadius={offer.borderRadius}
                                                            href={offer.href}
                                                        />
                                                    </div>
                                                ) : (
                                                    <SpecialOfferCard
                                                        imageUrl={offer.imageUrl}
                                                        discount={offer.discount}
                                                        startDay={offer.startDay}
                                                        endDay={offer.endDay}
                                                        month={offer.month}
                                                        hotelName={offer.hotelName}
                                                        city={offer.city}
                                                        borderRadius={offer.borderRadius}
                                                        href={offer.href}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-center gap-2">
                                    {formattedOffers.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => scrollToOffer(index)}
                                            className={`transition-all duration-300 cursor-pointer ${
                                                activeOfferIndex === index
                                                    ? 'w-6 h-2 rounded-full bg-[#01BDA5]'
                                                    : 'w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400'
                                            }`}
                                            aria-label={`Aller à l'offre ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Desktop : grille */}
                            <div className="hidden md:flex md:flex-wrap md:justify-center md:gap-24">
                                {formattedOffers.map((offer, index) => (
                                    index === 1 ? (
                                        <div key={offer.id}>
                                            <div className="text-center mb-4">
                                                <h2 className="text-2xl font-bold text-gray-900">{t('offer')}</h2>
                                                <Link href="/offre" className="text-gray-600 hover:underline text-sm">
                                                    {t('see_offer')}
                                                </Link>
                                            </div>
                                            <SpecialOfferCard
                                                imageUrl={offer.imageUrl}
                                                discount={offer.discount}
                                                startDay={offer.startDay}
                                                endDay={offer.endDay}
                                                month={offer.month}
                                                hotelName={offer.hotelName}
                                                city={offer.city}
                                                borderRadius={offer.borderRadius}
                                                href={offer.href}
                                            />
                                        </div>
                                    ) : (
                                        <SpecialOfferCard
                                            key={offer.id}
                                            imageUrl={offer.imageUrl}
                                            discount={offer.discount}
                                            startDay={offer.startDay}
                                            endDay={offer.endDay}
                                            month={offer.month}
                                            hotelName={offer.hotelName}
                                            city={offer.city}
                                            borderRadius={offer.borderRadius}
                                            href={offer.href}
                                        />
                                    )
                                ))}
                            </div>
                        </div>
                    </section>
                )}

{/* Section Découvertes */}
{villes.length > 0 && (
    <section
        ref={setDiscoverRef}
        className={`py-8 md:py-8 transition-all duration-700 ease-out overflow-visible ${
            isDiscoverVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        style={{ background: 'linear-gradient(to bottom, #FFFFFF, #EBE898, #01BDA5)' }}
    >
        <div className="container mx-auto px-6 overflow-visible">
            <div className="text-center mb-10 md:mb-12">
                <h2 className="text-4xl md:text-4xl lg:text-5xl font-light text-[#01BDA5] mb-2 font-rubik-distressed">
                    {t('discover')}
                </h2>
                <p className="text-[#01BDA5] text-sm md:text-base">
                    {t('discover_description')}
                </p>
            </div>

            {/* Carrousel commun pour mobile et desktop */}
            <div className="relative overflow-visible">
                {/* Boutons de navigation desktop */}
                <button
                    onClick={() => {
                        const container = discoverScrollRef.current
                        if (container) container.scrollBy({ left: -310, behavior: 'smooth' })
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer"
                    aria-label="Défiler vers la gauche"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>

                <div
                    ref={discoverScrollRef}
                    className="overflow-x-auto scroll-smooth pb-6 scrollbar-hide overflow-visible px-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <div className="flex gap-6 px-2 md:justify-center w-full  lg:justify-start">
                        {villes.map((ville) => (
                            <div key={ville.id} className="flex-shrink-0 min-w-[320px] p-2">
                                <SpecialDiscoverCard
                                    imageUrl={ville.image ?? '/photos/discover/hero-discover.jpg'}
                                    title={ville.nom}
                                    href={`/decouvrir/${ville.slug}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Boutons de navigation desktop droite */}
                <button
                    onClick={() => {
                        const container = discoverScrollRef.current
                        if (container) container.scrollBy({ left: 310, behavior: 'smooth' })
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110 hidden lg:flex items-center justify-center cursor-pointer"
                    aria-label="Défiler vers la droite"
                >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
            </div>

            {/* Indicateurs de pagination */}
            <div className="flex justify-center lg:hidden gap-2 mt-6">
                {villes.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollToDiscover(index)}
                        className={`transition-all duration-300 cursor-pointer ${
                            activeDiscoverIndex === index
                                ? 'w-6 h-2 rounded-full bg-white'
                                : 'w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Aller à la découverte ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    </section>
)}            </main>
        </>
    )
}
