'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Download, Apple, Smartphone } from 'lucide-react'
import Header from './components/molecules/Header'
import { useTranslations } from 'next-intl'

export default function HomePage() {
    const t = useTranslations('HomePage')
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <>
      <Header theme="default" />
      <main className="relative min-h-screen">
        {/* Image de fond hero */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/photos/bc.png" // Remplace par ton image
            alt="Evadia - Découvrez le monde"
            fill
            className="object-cover"
            priority
            quality={100}
          />
          {/* Overlay sombre pour améliorer la lisibilité du texte */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent" />
        </div>

        {/* Contenu */}
        <div className="relative z-10 flex flex-col justify-end min-h-screen pb-12 sm:pb-12 md:pb-16 lg:pb-24">
          <div className="container mx-auto px-6 ">

            {/* Animation d'apparition */}
            <div
              className={`
              transition-all duration-700 delay-200
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            `}
            >
              <div className="lg:flex items-end justify-between">
                {/* Titre */}
                <div className='mb-4'>
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-white mb-4 max-w-2xl leading-tight">
                  {t('hero_title')}
                </h1>

                {/* Accroche */}
                <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-xl leading-relaxed">
                  {t('hero_subtitle')}
                </p>
                </div>


                {/* Section téléchargement */}
                <div className="space-y-4">
                  <p className="text-white/80 text-sm sm:text-base flex items-center lg:justify-center gap-2">
                    <Download className="w-4 h-4" />
                    {t('download_app')}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    {/* Bouton iOS */}
                    <Link
                      href="https://apps.apple.com/app/evadia"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-105">
                        <Apple className="w-5 h-5 text-white" />
                        <span className="text-white font-medium">{t('ios')}</span>
                      </div>
                    </Link>

                    {/* Bouton Android */}
                    <Link
                      href="https://play.google.com/store/apps/evadia"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                    >
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

        {/* Indicateur de scroll (optionnel) */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 animate-bounce hidden md:block">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white/70 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </main>
    </>
  )
}