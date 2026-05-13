'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronLeft } from 'lucide-react'
import { useOnScreen } from '@/hooks/useOnScreen'
import HeroSection from '../../components/ui/HeroSection'
import DiscoverCardArticle from '../../components/ui/DiscoverCardArticle'

interface DiscoverArticleClientProps {
  articleId: number
  articleName: string
  slug: string
}

// Données mock (à remplacer par appel API)
const getArticleData = (id: number) => {
  const articlesData: Record<number, any> = {
    1: {
      id: 1,
      title: 'Paris, la ville lumière',
      heroImage: '/photos/discover/paris-hero.jpg',
      description: 'Découvrez Paris comme vous ne l\'avez jamais vue. La capitale française regorge de trésors cachés, de monuments emblématiques et d\'une atmosphère unique au monde.',
      sections: [
        {
          id: 1,
          images: ['/photos/chambre.jpg', '/photos/test.jpg', '/photos/chambre.jpg', '/photos/test.jpg'],
          placeName: 'Tour Eiffel',
          title: 'La Tour Eiffel, symbole de Paris',
          description: 'Construite par Gustave Eiffel pour l\'Exposition Universelle de 1889, la Tour Eiffel est devenue le symbole incontesté de Paris. Avec ses 330 mètres de hauteur, elle offre une vue imprenable sur la capitale. Que ce soit de jour ou de nuit, illuminée, elle reste le monument le plus visité au monde.',
          imagePosition: 'left'
        },
        {
          id: 2,
          images: ['/photos/discover/louvre-1.jpg', '/photos/discover/louvre-2.jpg'],
          placeName: 'Musée du Louvre',
          title: 'Le Louvre, le plus grand musée du monde',
          description: 'Ancienne résidence des rois de France, le Louvre est aujourd\'hui le plus grand musée du monde. Il abrite des milliers d\'œuvres d\'art, dont la célèbre Joconde de Léonard de Vinci. Ses collections couvrent des périodes allant de l\'Antiquité au XIXe siècle.',
          imagePosition: 'right'
        },
        {
          id: 3,
          images: ['/photos/discover/montmartre-1.jpg', '/photos/discover/montmartre-2.jpg', '/photos/discover/montmartre-3.jpg'],
          placeName: 'Montmartre',
          title: 'Montmartre, le village des artistes',
          description: 'Perché sur sa butte, Montmartre a su conserver son âme de village. Ses ruelles pavées, sa célèbre basilique du Sacré-Cœur et ses place du Tertre attirent les visiteurs du monde entier. C\'est ici que vécurent de grands artistes comme Picasso, Van Gogh ou Renoir.',
          imagePosition: 'left'
        }
      ]
    }
  }
  return articlesData[id] || null
}

export default function DiscoverArticleClient({ articleId, articleName, slug }: DiscoverArticleClientProps) {
  const router = useRouter()
  const t = useTranslations('DiscoverArticleClient')
  const [article, setArticle] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Animation au scroll
  const [setHeroRef, isHeroVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })
  const [setTitleRef, isTitleVisible] = useOnScreen({ threshold: 0.2, triggerOnce: false })

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true)
      try {
        const data = getArticleData(articleId)
        setArticle(data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticle()
  }, [articleId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">{t('loading')}</div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">{t('not_found')}</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      {/* HeroSection avec animation */}
      <div
        ref={setHeroRef}
        className={`transition-all duration-700 ease-out ${
          isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <HeroSection
          title={article.title}
          subtitle={article.description}
          backgroundImage={article.heroImage}
          showDownload={false}
          showScrollIndicator={false}
        />
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-[#01BDA5] transition-colors mb-8 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>{t('back_button')}</span>
        </button>

        {/* Titre de l'article */}
        <div
          ref={setTitleRef}
          className={`mb-12 transition-all duration-700 ease-out ${
            isTitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-gray-800 mb-4 text-left">
            {article.title}
          </h2>
          <p className="text-gray-600 max-w-3xl leading-relaxed text-left">
            {article.description}
          </p>
        </div>

        {/* Sections avec DiscoverCardArticle */}
        <div className="space-y-16">
          {article.sections.map((section: any) => (
            <DiscoverCardArticle
              key={section.id}
              images={section.images}
              placeName={section.placeName}
              title={section.title}
              description={section.description}
              imagePosition={section.imagePosition}
            />
          ))}
        </div>
      </div>
    </main>
  )
}