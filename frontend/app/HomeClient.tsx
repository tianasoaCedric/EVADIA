'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Download, Apple, Smartphone, ChevronLeft, ChevronRight } from 'lucide-react'
import Header from './components/molecules/Header'
import { useTranslations } from 'next-intl'
import CardDestination from './components/ui/CardDestination'
import { useOnScreen } from '@/hooks/useOnScreen'
import SpecialOfferCard from './components/ui/SpecialOfferCard'
import SpecialDiscoverCard from './components/ui/SpecialDiscoverCard'

export default function HomePage() {
    const t = useTranslations('HomePage')
    const [scrollPosition, setScrollPosition] = useState(0)
    const [activeOfferIndex, setActiveOfferIndex] = useState(1)
    const [activeDiscoverIndex, setActiveDiscoverIndex] = useState(0)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const offerScrollRef = useRef<HTMLDivElement>(null)
    const discoverScrollRef = useRef<HTMLDivElement>(null)
    
    const [setDestinationsRef, isDestinationsVisible] = useOnScreen({
        threshold: 0.2,
        triggerOnce: false
    })
    const [setHeroRef, isHeroVisible] = useOnScreen({
        threshold: 0.2,
        triggerOnce: false
    })
    const [setOffersRef, isOffersVisible] = useOnScreen({
        threshold: 0.2,
        triggerOnce: false
    })
    const [setDiscoverRef, isDiscoverVisible] = useOnScreen({
        threshold: 0.2,
        triggerOnce: false
    })

    // Calculer la position du scroll et le maxScroll pour les destinations
    useEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return

        const updateScrollInfo = () => {
            setScrollPosition(container.scrollLeft)
        }

        updateScrollInfo()
        container.addEventListener('scroll', updateScrollInfo)
        window.addEventListener('resize', updateScrollInfo)

        return () => {
            container.removeEventListener('scroll', updateScrollInfo)
            window.removeEventListener('resize', updateScrollInfo)
        }
    }, [])

    // Gestion du carrousel des offres
    useEffect(() => {
        const container = offerScrollRef.current
        if (!container) return

        const handleOfferScroll = () => {
            const scrollLeft = container.scrollLeft
            const cardWidth = 310
            const newIndex = Math.round(scrollLeft / cardWidth)
            setActiveOfferIndex(Math.min(newIndex, 2))
        }

        container.addEventListener('scroll', handleOfferScroll)
        return () => container.removeEventListener('scroll', handleOfferScroll)
    }, [])

    // Gestion du carrousel des découvertes
    useEffect(() => {
        const container = discoverScrollRef.current
        if (!container) return

        const handleDiscoverScroll = () => {
            const scrollLeft = container.scrollLeft
            const cardWidth = 310
            const newIndex = Math.round(scrollLeft / cardWidth)
            setActiveDiscoverIndex(Math.min(newIndex, specialDiscoverItems.length - 1))
        }

        container.addEventListener('scroll', handleDiscoverScroll)
        return () => container.removeEventListener('scroll', handleDiscoverScroll)
    }, [])

    // Données des destinations populaires
    const popularDestinations = [
        { id: 1, imageUrl: '/photos/test.jpg', title: 'Paris', href: '/destinations/paris' },
        { id: 2, imageUrl: '/photos/test.jpg', title: 'Maldives', href: '/destinations/maldives' },
        { id: 3, imageUrl: '/photos/test.jpg', title: 'Rome', href: '/destinations/rome' },
        { id: 4, imageUrl: '/photos/test.jpg', title: 'Tokyo', href: '/destinations/tokyo' },
        { id: 5, imageUrl: '/photos/test.jpg', title: 'New York', href: '/destinations/new-york' },
        { id: 6, imageUrl: '/photos/test.jpg', title: 'Bali', href: '/destinations/bali' },
        { id: 7, imageUrl: '/photos/test.jpg', title: 'Londres', href: '/destinations/londres' },
        { id: 8, imageUrl: '/photos/test.jpg', title: 'Dubai', href: '/destinations/dubai' }
    ]

    // Offres spéciales
    const specialOffers = [
        {
            id: 1,
            imageUrl: "/photos/offers/hotel-maldives.jpg",
            discount: 45,
            startDay: 1,
            endDay: 31,
            month: "aoû",
            hotelName: "Maldives Paradise",
            city: "Malé",
            borderRadius: "rounded-top-left-bottom-right" as const
        },
        {
            id: 2,
            imageUrl: "/photos/offers/hotel-paris.jpg",
            discount: 30,
            startDay: 1,
            endDay: 15,
            month: "jun",
            hotelName: "Hôtel Le Meurice",
            city: "Paris",
            borderRadius: "rounded-all" as const
        },
        {
            id: 3,
            imageUrl: "/photos/offers/hotel-rome.jpg",
            discount: 25,
            startDay: 15,
            endDay: 30,
            month: "sep",
            hotelName: "Hotel de Russie",
            city: "Rome",
            borderRadius: "rounded-top-right-bottom-left" as const
        }
    ]

    // Découvertes spéciales
    const specialDiscoverItems = [
        {
            id: 1,
            imageUrl: '/photos/discover/paris.jpg',
            title: 'Paris, la ville lumière',
            href: '/decouvertes/paris'
        },
        {
            id: 2,
            imageUrl: '/photos/discover/kyoto.jpg',
            title: 'Kyoto, tradition et modernité',
            href: '/decouvertes/kyoto'
        },
        {
            id: 3,
            imageUrl: '/photos/discover/santorini.jpg',
            title: 'Santorini, île des amoureux',
            href: '/decouvertes/santorini'
        }
    ]

    // Calculer l'index actif pour les destinations
    const getActiveIndex = () => {
        if (!scrollContainerRef.current) return 0
        const container = scrollContainerRef.current
        const scrollWidth = container.scrollWidth - container.clientWidth
        if (scrollWidth === 0) return 0
        const cardWidth = 320
        const activeIndex = Math.floor(scrollPosition / cardWidth)
        return Math.min(activeIndex, popularDestinations.length - 2)
    }

    const activeIndex = getActiveIndex()
    const totalDots = Math.max(1, popularDestinations.length - 2)

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' })
        }
    }

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' })
        }
    }

    const scrollToDot = (index: number) => {
        if (scrollContainerRef.current) {
            const cardWidth = 320
            scrollContainerRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' })
        }
    }

    const scrollToOffer = (index: number) => {
        if (offerScrollRef.current) {
            const cardWidth = 310
            offerScrollRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' })
            setActiveOfferIndex(index)
        }
    }

    const scrollToDiscover = (index: number) => {
        if (discoverScrollRef.current) {
            const cardWidth = 310
            discoverScrollRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' })
            setActiveDiscoverIndex(index)
        }
    }

    return (
        <>
            <Header theme="default" />
            <main className="relative min-h-screen">
                {/* Hero Section */}
                <section className="relative min-h-screen">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/photos/bc.png"
                            alt="Evadia - Découvrez le monde"
                            fill
                            className="object-cover"
                            priority
                            quality={100}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent" />
                    </div>

                    <div className="relative z-10 flex flex-col justify-end min-h-screen pb-12 sm:pb-12 md:pb-16 lg:pb-24">
                        <div className="container mx-auto px-6">
                            <div
                                ref={setHeroRef}
                                className={`transition-all duration-700 delay-200 ${
                                    isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                }`}
                            >
                                <div className="lg:flex items-end justify-between">
                                    <div className='mb-4'>
                                        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-white mb-4 max-w-2xl leading-tight">
                                            {t('hero_title')}
                                        </h1>
                                        <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-xl leading-relaxed">
                                            {t('hero_subtitle')}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-white/80 text-sm sm:text-base flex items-center lg:justify-center gap-2">
                                            <Download className="w-4 h-4" />
                                            {t('download_app')}
                                        </p>
                                        <div className="flex flex-wrap gap-4">
                                            <Link href="https://apps.apple.com/app/evadia" target="_blank" rel="noopener noreferrer" className="group">
                                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-105">
                                                    <Apple className="w-5 h-5 text-white" />
                                                    <span className="text-white font-medium">{t('ios')}</span>
                                                </div>
                                            </Link>
                                            <Link href="https://play.google.com/store/apps/evadia" target="_blank" rel="noopener noreferrer" className="group">
                                                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-105">
                                                    <Smartphone className="w-5 h-5 text-white" />
                                                    <span className="text-white font-medium">{t('android')}</span>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 animate-bounce hidden md:block">
                        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                            <div className="w-1 h-2 bg-white/70 rounded-full mt-2 animate-pulse" />
                        </div>
                    </div>
                </section>

                {/* Section Destinations Populaires */}
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
                        <div className="relative py-4 overflow-visible">
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
                                {popularDestinations.map((destination) => (
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

                {/* Section Offres Spéciales */}
                <section
                    ref={setOffersRef}
                    className={`py-8 md:py-8 transition-all duration-700 ease-out overflow-visible ${
                        isOffersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                >
                    <div className="container mx-auto px-6 overflow-visible">
                        {/* Version mobile : carrousel horizontal */}
                        <div className="md:hidden overflow-visible">
                            <div
                                ref={offerScrollRef}
                                className="overflow-x-auto scroll-smooth pb-6 scrollbar-hide overflow-visible px-2"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                <div className="flex gap-6 px-2">
                                    {specialOffers.map((offer, index) => (
                                        <div key={offer.id} className="flex-shrink-0 w-[280px] p-2">
                                            {index === 1 ? (
                                                <div>
                                                    <div className="text-center mb-4">
                                                        <h2 className="text-2xl font-bold text-gray-900">NOS OFFRES EXCLUSIVES</h2>
                                                        <p className="text-gray-600">Voir toutes les offres</p>
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
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-center gap-2">
                                {specialOffers.map((_, index) => (
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

                        {/* Version desktop : grille */}
                        <div className="hidden md:flex md:flex-wrap md:justify-center md:gap-24 ">
                            {specialOffers.map((offer, index) => (
                                index === 1 ? (
                                    <div key={offer.id}>
                                        <div className="text-center mb-4">
                                            <h2 className="text-2xl font-bold text-gray-900">{t('offer')}</h2>
                                            <p className="text-gray-600">{t('see_offer')}</p>
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
                                    />
                                )
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section Découvertes */}
                <section
                    ref={setDiscoverRef}
                    className={`py-8 md:py-8 transition-all duration-700 ease-out overflow-visible ${
                        isDiscoverVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                    style={{
        background: 'linear-gradient(to bottom, #FFFFFF, #EBE898, #01BDA5)'
    }}
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

                        {/* Version mobile : carrousel horizontal */}
                        <div className="md:hidden overflow-visible">
                            <div
                                ref={discoverScrollRef}
                                className="overflow-x-auto scroll-smooth pb-6 scrollbar-hide overflow-visible px-2"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                <div className="flex gap-6 px-2">
                                    {specialDiscoverItems.map((item) => (
                                        <div key={item.id} className="flex-shrink-0 w-[280px] p-2">
                                            <SpecialDiscoverCard
                                                imageUrl={item.imageUrl}
                                                title={item.title}
                                                href={item.href}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-center gap-2 mt-6">
                                {specialDiscoverItems.map((_, index) => (
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

                        {/* Version desktop : grille 3 cartes */}
                        <div className="hidden md:flex md:justify-center md:gap-24 lg:gap-32">
                            {specialDiscoverItems.map((item) => (
                                <div key={item.id} className="flex justify-center w-[280px] p-2">
                                    <SpecialDiscoverCard
                                        imageUrl={item.imageUrl}
                                        title={item.title}
                                        href={item.href}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}