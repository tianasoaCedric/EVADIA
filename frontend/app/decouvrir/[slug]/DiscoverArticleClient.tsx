'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronLeft } from 'lucide-react'
import { useOnScreen } from '@/hooks/useOnScreen'
import HeroSection from '../../components/ui/HeroSection'
import DiscoverCardArticle from '../../components/ui/DiscoverCardArticle'
import type { VilleDecouverte, LieuDecouverte } from '@/lib/types'

interface Props {
  slug: string
  initialVille: VilleDecouverte | null
  initialLieux: LieuDecouverte[]
}

export default function DiscoverArticleClient({ slug, initialVille, initialLieux }: Props) {
  const router = useRouter()
  const t = useTranslations('DiscoverArticleClient')
  const [ville] = useState<VilleDecouverte | null>(initialVille)
  const [lieux] = useState<LieuDecouverte[]>(initialLieux)

  const [setHeroRef, isHeroVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })
  const [setTitleRef, isTitleVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })

  void slug

  if (!ville) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">{t('not_found')}</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <div
        ref={setHeroRef}
        className={`transition-all duration-700 ease-out ${isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <HeroSection
          title={ville.nom}
          subtitle=""
          backgroundImage={ville.image ?? '/photos/discover/hero-discover.jpg'}
          showDownload={false}
          showScrollIndicator={false}
        />
      </div>

      <div className="container mx-auto px-4 py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-[#01BDA5] transition-colors mb-8 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>{t('back_button')}</span>
        </button>

        <div
          ref={setTitleRef}
          className={`mb-12 transition-all duration-700 ease-out ${isTitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-gray-800 mb-4 text-left">
            {ville.nom}
          </h2>
        </div>

        {lieux.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            Aucun lieu disponible pour cette ville.
          </div>
        ) : (
          <div className="space-y-16">
            {lieux.map((lieu) => (
              <DiscoverCardArticle
                key={lieu.id}
                images={lieu.images ?? []}
                placeName={lieu.emplacement ?? lieu.nom}
                title={lieu.nom}
                description={lieu.description ?? ''}
                imagePosition={lieu.position_image}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
