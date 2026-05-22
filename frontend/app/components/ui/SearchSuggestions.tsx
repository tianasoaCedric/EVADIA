'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Search, MapPin, Building, Hotel, Tag, X } from 'lucide-react'

export interface Suggestion {
  id: number
  name: string
  type: 'destination' | 'hotel' | 'city' | 'category'
  imageUrl: string
  href: string
  subtitle?: string
}

interface SearchSuggestionsProps {
  searchQuery: string
  onSelect: (suggestion: Suggestion) => void
  onClose: () => void
  isOpen: boolean
  suggestions?: Suggestion[]
}

// Icône par type
const getTypeIcon = (type: Suggestion['type']) => {
  switch (type) {
    case 'destination':
      return <MapPin className="w-4 h-4" />
    case 'hotel':
      return <Hotel className="w-4 h-4" />
    case 'city':
      return <Building className="w-4 h-4" />
    case 'category':
      return <Tag className="w-4 h-4" />
    default:
      return <Search className="w-4 h-4" />
  }
}

// Couleur par type
const getTypeColor = (type: Suggestion['type']) => {
  switch (type) {
    case 'destination':
      return 'bg-blue-100 text-blue-700'
    case 'hotel':
      return 'bg-green-100 text-green-700'
    case 'city':
      return 'bg-purple-100 text-purple-700'
    case 'category':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

// Traduction du type
const getTypeLabel = (type: Suggestion['type'], t: (key: string) => string) => {
  switch (type) {
    case 'destination':
      return t('type_destination')
    case 'hotel':
      return t('type_hotel')
    case 'city':
      return t('type_city')
    case 'category':
      return t('type_category')
    default:
      return ''
  }
}

// Données mock (à remplacer par appel API)
const getMockSuggestions = (query: string): Suggestion[] => {
  if (!query) return []
  
  const allSuggestions: Suggestion[] = [
    {
      id: 1,
      name: 'Paris',
      type: 'destination',
      imageUrl: '/photos/destinations/paris.jpg',
      href: '/destination/paris-1',
      subtitle: 'France'
    },
    {
      id: 2,
      name: 'Hôtel Le Meurice',
      type: 'hotel',
      imageUrl: '/photos/hotels/ecolodge-1.jpg',
      href: '/hotel/1-hotel-le-meurice',
      subtitle: 'Paris, France'
    },
    {
      id: 3,
      name: 'Antananarivo',
      type: 'city',
      imageUrl: '/photos/destinations/tananarive.jpg',
      href: '/ville/antananarivo-1',
      subtitle: 'Madagascar'
    },
    {
      id: 4,
      name: 'Ecolodge',
      type: 'category',
      imageUrl: '/photos/categories/ecolodge.jpg',
      href: '/hebergement/ecolodge-1',
      subtitle: 'Type d\'hébergement'
    },
    {
      id: 5,
      name: 'Maldives',
      type: 'destination',
      imageUrl: '/photos/destinations/maldives.jpg',
      href: '/destination/maldives-2',
      subtitle: 'Océan Indien'
    },
    {
      id: 6,
      name: 'Villa de Rêve',
      type: 'hotel',
      imageUrl: '/photos/hotels/villa-1.jpg',
      href: '/hotel/4-villa-de-reve',
      subtitle: 'Malé, Maldives'
    },
  ]

  return allSuggestions.filter(s => 
    s.name.toLowerCase().includes(query.toLowerCase())
  )
}

export default function SearchSuggestions({
  searchQuery,
  onSelect,
  onClose,
  isOpen,
  suggestions: externalSuggestions
}: SearchSuggestionsProps) {
  const t = useTranslations('SearchSuggestions')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen || !searchQuery.trim()) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      setIsLoading(true)
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 300))
      
      if (externalSuggestions) {
        setSuggestions(externalSuggestions)
      } else {
        setSuggestions(getMockSuggestions(searchQuery))
      }
      setIsLoading(false)
    }

    fetchSuggestions()
  }, [searchQuery, isOpen, externalSuggestions])

  // Navigation clavier
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, -1))
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault()
        onSelect(suggestions[selectedIndex])
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, suggestions, selectedIndex, onSelect, onClose])

  if (!isOpen || !searchQuery.trim()) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Suggestions */}
      <div 
        ref={containerRef}
        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
      >
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-pulse text-gray-400">{t('loading')}</div>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="p-4 text-center">
            <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">{t('no_results')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('try_another')}</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.id}-${suggestion.type}`}
                onClick={() => onSelect(suggestion)}
                className={`
                  w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left cursor-pointer
                  ${selectedIndex === index ? 'bg-gray-50' : ''}
                `}
              >
                {/* Photo */}
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={suggestion.imageUrl}
                    alt={suggestion.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {suggestion.name}
                  </p>
                  {suggestion.subtitle && (
                    <p className="text-xs text-gray-400 truncate">
                      {suggestion.subtitle}
                    </p>
                  )}
                </div>
                
                {/* Type */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(suggestion.type)}`}>
                  {getTypeIcon(suggestion.type)}
                  <span>{getTypeLabel(suggestion.type, t)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}