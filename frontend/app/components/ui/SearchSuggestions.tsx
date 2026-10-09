'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Search, MapPin, Building2, BedDouble, Tag, Compass } from 'lucide-react'
import {
  createSearchDebounce,
  type SearchResults,
  type SearchHotel,
  type SearchDestination,
  type SearchVille,
  type SearchType,
  type SearchDecouverteVille,
  type SearchDecouverteLieu,
} from '@/lib/services/search.service'
import { createSlug } from '@/lib/slug'

export interface Suggestion {
  id: number
  name: string
  type: 'destination' | 'hotel' | 'city' | 'category' | 'discover'
  imageUrl: string | null
  href: string
  subtitle?: string
}

interface SearchSuggestionsProps {
  searchQuery: string
  onSelect: (suggestion: Suggestion) => void
  onClose: () => void
  isOpen: boolean
}

// Configuration des types pour l'affichage
const getTypeConfig = (t: ReturnType<typeof useTranslations>) => ({
  destination: { label: t('type_destination'), color: 'bg-blue-100 text-blue-700',     Icon: MapPin    },
  hotel:       { label: t('type_hotel'),        color: 'bg-green-100 text-green-700',   Icon: BedDouble },
  city:        { label: t('type_city'),        color: 'bg-purple-100 text-purple-700', Icon: Building2 },
  category:    { label: t('type_category'),   color: 'bg-orange-100 text-orange-700',  Icon: Tag       },
  discover:    { label: t('type_discover'),  color: 'bg-teal-100 text-teal-700',      Icon: Compass   },
})

// Stable debounce instance — created once per component mount
const debounce = createSearchDebounce(250)

function toSuggestions(results: SearchResults): Suggestion[] {
  const hotels: Suggestion[] = results.hotels.map((h: SearchHotel) => ({
    id: h.id,
    name: h.nom,
    type: 'hotel',
    imageUrl: h.photo_principale,
    href: `/hotel/${createSlug(h.id, h.nom)}`,
    subtitle: [h.ville, h.pays].filter(Boolean).join(', ') || undefined,
  }))

  const destinations: Suggestion[] = results.destinations.map((d: SearchDestination) => ({
    id: d.id,
    name: d.nom,
    type: 'destination',
    imageUrl: d.image_url,
    href: `/destination/${createSlug(d.id, d.nom)}`,
  }))

  const villes: Suggestion[] = results.villes.map((v: SearchVille) => ({
    id: v.id,
    name: v.nom,
    type: 'city',
    imageUrl: v.image,
    href: `/ville/${createSlug(v.id, v.nom)}`,
    subtitle: v.destination_nom ?? undefined,
  }))

  const types: Suggestion[] = results.types.map((t: SearchType) => ({
    id: t.id,
    name: t.nom,
    type: 'category',
    imageUrl: t.image,
    href: `/hebergement/${createSlug(t.id, t.nom)}`,
    subtitle: "Type d'hébergement",
  }))

  const decVilles: Suggestion[] = results.decouverte_villes.map((v: SearchDecouverteVille) => ({
    id: v.id * 10,        // namespace distinct des lieux
    name: v.nom,
    type: 'discover',
    imageUrl: v.image,
    href: `/decouvrir/${v.slug}`,
    subtitle: 'Découverte',
  }))

  const decLieux: Suggestion[] = results.decouverte_lieux.map((l: SearchDecouverteLieu) => ({
    id: l.id * 10 + 1,    // namespace distinct des villes
    name: l.nom,
    type: 'discover',
    imageUrl: l.image,
    href: `/decouvrir/${l.ville_slug ?? ''}`,
    subtitle: l.ville_nom ?? 'Découverte',
  }))

  return [...destinations, ...villes, ...hotels, ...types, ...decVilles, ...decLieux]
}

export default function SearchSuggestions({
  searchQuery,
  onSelect,
  onClose,
  isOpen,
}: SearchSuggestionsProps) {
  const t = useTranslations('SearchSuggestions')
  const typeConfig = getTypeConfig(t)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading]     = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const listRef = useRef<HTMLDivElement>(null)

  // Reset selection when suggestions change
  useEffect(() => { setSelectedIndex(-1) }, [suggestions])

  // Fetch debounced
  useEffect(() => {
    if (!isOpen) { setSuggestions([]); return }

    debounce(
      searchQuery,
      true,
      (r) => setSuggestions(toSuggestions(r)),
      setIsLoading,
    )
  }, [searchQuery, isOpen])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      onSelect(suggestions[selectedIndex])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [isOpen, suggestions, selectedIndex, onSelect, onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex < 0 || !listRef.current) return
    const item = listRef.current.children[selectedIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (!isOpen || searchQuery.trim().length < 2) return null

  return (
    <>
      {/* Overlay transparent pour fermer au clic extérieur */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
        {isLoading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-12 h-12 rounded-lg bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 bg-gray-100 animate-pulse rounded" />
                  <div className="h-3 w-20 bg-gray-100 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="p-6 text-center">
            <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{t('no_results')}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t('try_another')}</p>
          </div>
        ) : (
          <div ref={listRef} className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {suggestions.map((s, i) => {
              const cfg = typeConfig[s.type]
              return (
                <button
                  key={`${s.type}-${s.id}`}
                  onClick={() => onSelect(s)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer ${
                    selectedIndex === i ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Miniature */}
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {s.imageUrl ? (
                      <Image src={s.imageUrl} alt={s.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <cfg.Icon className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Texte */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                    {s.subtitle && (
                      <p className="text-xs text-gray-400 truncate">{s.subtitle}</p>
                    )}
                  </div>

                  {/* Badge type */}
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${cfg.color}`}>
                    <cfg.Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}