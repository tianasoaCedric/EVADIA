'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useOnScreen } from '@/hooks/useOnScreen'
import HeroSection from '../components/ui/HeroSection'
import DiscoverCard from '../components/ui/DiscoverCard'
import Input from '../components/ui/Input'
import type { VilleDecouverte } from '@/lib/types'

interface DiscoverClientProps {
  initialVilles: VilleDecouverte[]
}

export default function DiscoverClient({ initialVilles }: DiscoverClientProps) {
  const t = useTranslations('DiscoverClient')
  const [villes] = useState<VilleDecouverte[]>(initialVilles)
  const [filtered, setFiltered] = useState<VilleDecouverte[]>(initialVilles)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const [setHeroRef, isHeroVisible] = useOnScreen({ threshold: 0.2,  })
  const [setTitleRef, isTitleVisible] = useOnScreen({ threshold: 0.2,  })
  const [setSearchRef, isSearchVisible] = useOnScreen({ threshold: 0.2,  })

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase()
    setFiltered(q ? villes.filter(v => v.nom.toLowerCase().includes(q)) : villes)
    setCurrentPage(1)
  }, [searchQuery, villes])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const current = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    document.getElementById('discover-list')?.scrollIntoView({ behavior: 'smooth' })
  }

  const grid = useMemo(() => {
    const rows = []
    let cardIndex = 0
    for (let i = 0; i < current.length; i += 3) {
      const row = current.slice(i, i + 3)
      rows.push(
        <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 justify-items-center">
          {row.map((ville, index) => {
            const idx = cardIndex++
            return (
              <div
                key={ville.id}
                className={`w-full max-w-[320px] transition-[transform] duration-300 ${index === 1 && row.length === 3 ? 'md:mt-12' : ''}`}
              >
                <DiscoverCard
                  imageUrl={ville.image ?? '/photos/discover/hero-discover.jpg'}
                  title={ville.nom}
                  href={`/decouvrir/${ville.slug}`}
                  priority={idx < 3}
                />
              </div>
            )
          })}
        </div>
      )
    }
    return rows
  }, [current])

  return (
    <main className="min-h-screen">
      <div
        ref={setHeroRef}
        className={`transition-all duration-700 ease-out ${isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <HeroSection
          title={t('hero_title')}
          subtitle={t('hero_subtitle')}
          backgroundImage="/photos/discover/hero-discover.jpg"
          showDownload={false}
          showScrollIndicator={true}
        />
      </div>

      <div className="container mx-auto px-6 py-12">
        <div
          ref={setTitleRef}
          className={`mb-12 transition-all duration-700 ease-out ${isTitleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-gray-800 mb-4 text-left">
            {t('section_title')}
          </h2>
          <p className="text-gray-600 max-w-3xl leading-relaxed text-left">
            {t('section_description')}
          </p>
        </div>

        <div
          ref={setSearchRef}
          className={`max-w-md mx-auto mb-12 transition-all duration-700 ease-out ${isSearchVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <Input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5 text-gray-400" />}
            fullWidth
            variant="light"
            placeholderPosition="left"
          />
        </div>

        <div id="discover-list">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">{t('no_results')}</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-6 py-2 rounded-full border border-[#01BDA5] text-[#01BDA5] hover:bg-[#01BDA5] hover:text-white transition-colors cursor-pointer"
                >
                  {t('clear_search')}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="transition-all duration-700 ease-out">
                {grid}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-full transition-all duration-200 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}`}
                    aria-label={t('previous_page')}
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`w-8 h-8 rounded-full transition-all duration-200 cursor-pointer ${currentPage === page ? 'bg-[#01BDA5] text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                          >
                            {page}
                          </button>
                        )
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="w-8 h-8 flex items-center justify-center text-gray-400">...</span>
                      }
                      return null
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-full transition-all duration-200 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}`}
                    aria-label={t('next_page')}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              )}

              <div className="text-center mt-6 text-sm text-gray-500">
                {filtered.length} {filtered.length > 1 ? t('results_plural') : t('results_singular')}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
