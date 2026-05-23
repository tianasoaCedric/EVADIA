'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Download, Apple, Smartphone } from 'lucide-react'
import { useOnScreen } from '@/hooks/useOnScreen'
import { useRef } from 'react'

interface HeroSectionProps {
    /** Titre principal */
    title: string
    /** Accroche / sous-titre */
    subtitle: string
    /** URL de l'image de fond */
    backgroundImage: string
    /** Lien pour le téléchargement iOS */
    iosLink?: string
    /** Lien pour le téléchargement Android */
    androidLink?: string
    /** Afficher la section de téléchargement */
    showDownload?: boolean
    /** Texte du bouton iOS (optionnel) */
    iosText?: string
    /** Texte du bouton Android (optionnel) */
    androidText?: string
    /** Texte "Téléchargez l'application" */
    downloadText?: string
    /** Afficher l'indicateur de scroll */
    showScrollIndicator?: boolean
    /** Classes supplémentaires */
    className?: string
}

const HeroSection = ({
    title,
    subtitle,
    backgroundImage,
    iosLink = "https://apps.apple.com/app/evadia",
    androidLink = "https://play.google.com/store/apps/evadia",
    showDownload = true,
    iosText = "iOS",
    androidText = "Android",
    downloadText = "Téléchargez l'application",
    showScrollIndicator = true,
    className = ""
}: HeroSectionProps) => {
    const heroRef = useRef<HTMLDivElement>(null)
    const [setHeroRef, isHeroVisible] = useOnScreen({
        threshold: 0.2,
    })

    return (
        <section className={`relative min-h-screen ${className}`}>
            {/* Image de fond */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={backgroundImage}
                    alt="Evadia - Découvrez le monde"
                    fill
                    className="object-cover"
                    priority
                    quality={80}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent" />
            </div>

            {/* Contenu */}
            <div className="relative z-10 flex flex-col justify-end min-h-screen pb-12 sm:pb-12 md:pb-16 lg:pb-24">
                <div className="container mx-auto px-6">
                    <div
                        ref={setHeroRef}
                        className={`transition-all duration-700 delay-200 ${
                            isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }`}
                    >
                        <div className="lg:flex items-end justify-between">
                            {/* Texte */}
                            <div className='mb-4'>
                                <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-white mb-4 max-w-2xl leading-tight">
                                    {title}
                                </h1>
                                <p className="text-xl sm:text-xl md:text-2xl text-white/90 max-w-xl leading-relaxed">
                                    {subtitle}
                                </p>
                            </div>

                            {/* Section téléchargement */}
                            {showDownload && (
                                <div className="space-y-4">
                                    <p className="text-white/80 text-sm sm:text-base flex items-center lg:justify-center gap-2">
                                        <Download className="w-4 h-4" />
                                        {downloadText}
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        {/* Bouton iOS */}
                                        <Link
                                            href={iosLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group"
                                        >
                                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-105">
                                                <Apple className="w-5 h-5 text-white" />
                                                <span className="text-white font-medium">{iosText}</span>
                                            </div>
                                        </Link>

                                        {/* Bouton Android */}
                                        <Link
                                            href={androidLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group"
                                        >
                                            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-105">
                                                <Smartphone className="w-5 h-5 text-white" />
                                                <span className="text-white font-medium">{androidText}</span>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Indicateur de scroll */}
            {showScrollIndicator && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 animate-bounce hidden md:block">
                    <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                        <div className="w-1 h-2 bg-white/70 rounded-full mt-2 animate-pulse" />
                    </div>
                </div>
            )}
        </section>
    )
}

export default HeroSection