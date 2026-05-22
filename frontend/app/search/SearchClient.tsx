'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ChevronLeft, X, ChevronLeft as ChevLeft, ChevronRight as ChevRight, MapPin, Building2, BedDouble, Tag, Compass } from 'lucide-react'
import Header from '../components/molecules/Header'
import CardHotel from '../components/ui/CardHotel'
import CardDestination from '../components/ui/CardDestination'
import { createSlug } from '@/lib/slug'
import {
  fetchSearch,
  createSearchDebounce,
  type SearchResults,
  type SearchHotel,
  type SearchDestination,
  type SearchVille,
  type SearchType,
  type SearchDecouverteVille,
  type SearchDecouverteLieu,
} from '@/lib/services/search.service'

interface SearchClientProps {
  searchQuery: string
}

type FilterType = 'hotel' | 'destination' | 'city' | 'category' | 'discover'

const FILTER_CONFIG: Record<FilterType, { label: string; color: string; activeColor: string; Icon: React.ElementType }> = {
  hotel:       { label: 'Hôtels',               color: 'bg-gray-100 text-gray-600', activeColor: 'bg-green-100 text-green-700',   Icon: BedDouble },
  destination: { label: 'Destinations',          color: 'bg-gray-100 text-gray-600', activeColor: 'bg-blue-100 text-blue-700',     Icon: MapPin    },
  city:        { label: 'Villes',                color: 'bg-gray-100 text-gray-600', activeColor: 'bg-purple-100 text-purple-700', Icon: Building2 },
  category:    { label: "Types d'hébergement",   color: 'bg-gray-100 text-gray-600', activeColor: 'bg-orange-100 text-orange-700', Icon: Tag       },
  discover:    { label: 'Découverte',            color: 'bg-gray-100 text-gray-600', activeColor: 'bg-teal-100 text-teal-700',     Icon: Compass   },
}

// Debounce instance stable pour la page
const debounce = createSearchDebounce(300)

// ── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

// ── Carousel section ─────────────────────────────────────────────────────────
function CarouselSection({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scroll = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' })

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <span className="text-sm text-gray-400">({count})</span>
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {children}
      </div>

      {/* Mobile carousel */}
      <div className="relative md:hidden">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-all hover:scale-110 cursor-pointer"
          aria-label="Précédent"
        >
          <ChevLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scroll-smooth gap-4 pb-4 scrollbar-hide px-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {Array.isArray(children)
            ? (children as React.ReactNode[]).map((child, i) => (
                <div key={i} className="flex-shrink-0 w-[260px]">{child}</div>
              ))
            : <div className="flex-shrink-0 w-[260px]">{children}</div>}
        </div>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-all hover:scale-110 cursor-pointer"
          aria-label="Suivant"
        >
          <ChevRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </section>
  )
}

export default function SearchClient({ searchQuery }: SearchClientProps) {
  const router = useRouter()
  const t = useTranslations('Search')

  const [results, setResults]         = useState<SearchResults | null>(null)
  const [isLoading, setIsLoading]     = useState(searchQuery.trim().length >= 2)
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([])

  // Chargement initial (SSR → client hydration avec les vraies données)
  useEffect(() => {
    if (searchQuery.trim().length < 2) { setResults(null); setIsLoading(false); return }

    setIsLoading(true)
    fetchSearch(searchQuery, false)
      .then(setResults)
      .finally(() => setIsLoading(false))
  }, [searchQuery])

  const toggleFilter = useCallback((f: FilterType) => {
    setActiveFilters(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    )
  }, [])

  // Totaux par section
  const counts = useMemo(() => ({
    hotel:       results?.hotels.length ?? 0,
    destination: results?.destinations.length ?? 0,
    city:        results?.villes.length ?? 0,
    category:    results?.types.length ?? 0,
    discover:    (results?.decouverte_villes.length ?? 0) + (results?.decouverte_lieux.length ?? 0),
  }), [results])

  const totalVisible = useMemo(() => {
    if (!results) return 0
    const all = counts.hotel + counts.destination + counts.city + counts.category
    if (activeFilters.length === 0) return all
    return activeFilters.reduce((s, f) => s + counts[f], 0)
  }, [results, counts, activeFilters])

  const show = useCallback((type: FilterType) =>
    activeFilters.length === 0 || activeFilters.includes(type), [activeFilters])

  return (
    <>
      <Header theme="dark" />
      <main className="min-h-screen pt-24 pb-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">

          {/* En-tête */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => router.back()}
                className="text-gray-900 hover:text-[#01BDA5] transition-colors cursor-pointer"
                aria-label="Retour"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {t('title')}
              </h1>
            </div>
            <p className="text-gray-500 pl-10">
              {t('results_for', { query: searchQuery })}
            </p>
          </div>

          {/* Filtres */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-wrap gap-2">
              {(Object.entries(FILTER_CONFIG) as [FilterType, typeof FILTER_CONFIG[FilterType]][]).map(([type, cfg]) => {
                const active = activeFilters.includes(type)
                const n = counts[type]
                if (n === 0) return null
                return (
                  <button
                    key={type}
                    onClick={() => toggleFilter(type)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer ${
                      active ? cfg.activeColor + ' shadow-sm' : cfg.color + ' hover:bg-gray-200'
                    }`}
                  >
                    <cfg.Icon className="w-3.5 h-3.5" />
                    <span>{cfg.label}</span>
                    <span className="opacity-60">({n})</span>
                    {active && <X className="w-3 h-3 ml-0.5" />}
                  </button>
                )
              })}
              {activeFilters.length > 0 && (
                <button
                  onClick={() => setActiveFilters([])}
                  className="px-4 py-2 rounded-full text-sm text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  {t('clear_filters')}
                </button>
              )}
            </div>
            {!isLoading && results && (
              <p className="text-sm text-gray-400">
                {totalVisible} {totalVisible > 1 ? t('results_plural') : t('results_singular')}
              </p>
            )}
          </div>

          {/* Contenu */}
          {isLoading ? (
            <div className="space-y-12">
              {[4, 3].map((n, si) => (
                <section key={si}>
                  <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-4" />
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[...Array(n)].map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                </section>
              ))}
            </div>
          ) : !results || totalVisible === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('no_results')}</h3>
              <p className="text-gray-400 text-sm">{t('no_results_description')}</p>
            </div>
          ) : (
            <div className="space-y-12">

              {/* Destinations */}
              {show('destination') && results.destinations.length > 0 && (
                <CarouselSection title={FILTER_CONFIG.destination.label} count={results.destinations.length}>
                  {results.destinations.map((d: SearchDestination) => (
                    <CardDestination
                      key={d.id}
                      imageUrl={d.image_url ?? '/photos/chambre.jpg'}
                      title={d.nom}
                      href={`/destination/${createSlug(d.id, d.nom)}`}
                      height="h-52"
                      width="w-full"
                      hoverEffect="zoom"
                    />
                  ))}
                </CarouselSection>
              )}

              {/* Villes */}
              {show('city') && results.villes.length > 0 && (
                <CarouselSection title={FILTER_CONFIG.city.label} count={results.villes.length}>
                  {results.villes.map((v: SearchVille) => (
                    <CardDestination
                      key={v.id}
                      imageUrl={v.image ?? '/photos/chambre.jpg'}
                      title={v.nom}
                      href={`/ville/${createSlug(v.id, v.nom)}`}
                      height="h-52"
                      width="w-full"
                      hoverEffect="zoom"
                    />
                  ))}
                </CarouselSection>
              )}

              {/* Hôtels */}
              {show('hotel') && results.hotels.length > 0 && (
                <CarouselSection title={FILTER_CONFIG.hotel.label} count={results.hotels.length}>
                  {results.hotels.map((h: SearchHotel) => (
                    <CardHotel
                      key={h.id}
                      imageUrl={h.photo_principale ?? ''}
                      name={h.nom}
                      hotelId={h.id}
                      availability="Disponible"
                      price={h.prix_min_mga ?? 0}
                      prixMga={h.prix_min_mga ?? undefined}
                      prixEur={h.prix_min_eur ?? undefined}
                      etoiles={h.etoiles ?? undefined}
                      rating={h.note_moyenne ?? 0}
                    />
                  ))}
                </CarouselSection>
              )}

              {/* Types d'hébergement */}
              {show('category') && results.types.length > 0 && (
                <CarouselSection title={FILTER_CONFIG.category.label} count={results.types.length}>
                  {results.types.map((ty: SearchType) => (
                    <CardDestination
                      key={ty.id}
                      imageUrl={ty.image ?? '/photos/chambre.jpg'}
                      title={ty.nom}
                      href={`/hebergement/${createSlug(ty.id, ty.nom)}`}
                      height="h-52"
                      width="w-full"
                      hoverEffect="zoom"
                    />
                  ))}
                </CarouselSection>
              )}

              {/* Découverte — villes */}
              {show('discover') && results.decouverte_villes.length > 0 && (
                <CarouselSection title="Destinations à découvrir" count={results.decouverte_villes.length}>
                  {results.decouverte_villes.map((v: SearchDecouverteVille) => (
                    <CardDestination
                      key={`dv-${v.id}`}
                      imageUrl={v.image ?? '/photos/chambre.jpg'}
                      title={v.nom}
                      href={`/decouvrir/${v.slug}`}
                      height="h-52"
                      width="w-full"
                      hoverEffect="zoom"
                    />
                  ))}
                </CarouselSection>
              )}

              {/* Découverte — lieux */}
              {show('discover') && results.decouverte_lieux.length > 0 && (
                <CarouselSection title="Lieux à découvrir" count={results.decouverte_lieux.length}>
                  {results.decouverte_lieux.map((l: SearchDecouverteLieu) => (
                    <CardDestination
                      key={`dl-${l.id}`}
                      imageUrl={l.image ?? '/photos/chambre.jpg'}
                      title={l.nom}
                      href={`/decouvrir/${l.ville_slug ?? ''}`}
                      height="h-52"
                      width="w-full"
                      hoverEffect="zoom"
                    />
                  ))}
                </CarouselSection>
              )}

            </div>
          )}
        </div>
      </main>
    </>
  )
}
