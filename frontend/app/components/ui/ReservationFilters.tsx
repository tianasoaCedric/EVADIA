'use client'

import { useTranslations } from 'next-intl'
import { Search } from 'lucide-react'
import Input from './Input'

interface ReservationFiltersProps {
  filter: string
  setFilter: (filter: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export default function ReservationFilters({ 
  filter, 
  setFilter, 
  searchQuery, 
  setSearchQuery 
}: ReservationFiltersProps) {
  const t = useTranslations('Reservations')

  const filters = [
    { id: 'all', label: t('filter_all') },
    { id: 'confirmed', label: t('filter_confirmed') },
    { id: 'pending', label: t('filter_pending') },
    { id: 'cancelled', label: t('filter_cancelled') },
    { id: 'completed', label: t('filter_completed') },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="flex-1">
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
      <div className="flex gap-2 overflow-x-scroll scrollbar-hide pb-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              filter === f.id
                ? 'bg-[#01BDA5] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}