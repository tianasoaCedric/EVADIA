'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Search, MapPin, DollarSign, Calendar, Star, Building2, Tag, X, Filter, Percent } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Input from './Input'
import { destinationService, typeHotelService } from '@/lib/services'
import type { Destination, TypeHotel } from '@/lib/types'

interface FiltersProps {
    onFilterChange: (filters: FilterValues) => void
    initialFilters?: Partial<FilterValues>
    className?: string
    enabledFilters?: FilterType[]
}

export type FilterType = 
    | 'destination'
    | 'type'
    | 'price'
    | 'availability'
    | 'dates'
    | 'stars'
    | 'rating'
    | 'offre'
    | 'discount'

export interface FilterValues {
    search: string
    destinationId: number | null
    priceMin: number | null
    priceMax: number | null
    availability: 'all' | 'disponible' | 'complet'
    stars: number
    minRating: number
    typeHebergementId: number | null
    checkIn: Date | null
    checkOut: Date | null
    offreType: 'all' | 'promo' | 'last_minute' | 'early_bird'
    discountMin: number | null
}

const defaultFilters: FilterValues = {
    search: '',
    destinationId: null,
    priceMin: null,
    priceMax: null,
    availability: 'all',
    stars: 0,
    minRating: 0,
    typeHebergementId: null,
    checkIn: null,
    checkOut: null,
    offreType: 'all',
    discountMin: null
}

// Composant d'étoiles pour le filtre
const StarFilter = ({ selected, onChange }: { selected: number; onChange: (value: number) => void }) => {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => onChange(star === selected ? 0 : star)}
                    className={`transition-all duration-200 hover:scale-110 ${star <= selected ? 'opacity-100' : 'opacity-40'}`}
                >
                    <Star className={`w-6 h-6 ${star <= selected ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                </button>
            ))}
        </div>
    )
}

// Composant d'étoiles pour la note (avis)
const RatingFilter = ({ selected, onChange }: { selected: number; onChange: (value: number) => void }) => {
    const ratings = [4.5, 4.0, 3.5, 3.0]
    
    return (
        <div className="flex flex-wrap gap-2">
            {ratings.map((rating) => (
                <button
                    key={rating}
                    onClick={() => onChange(rating === selected ? 0 : rating)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                        selected === rating
                            ? 'bg-[#01BDA5] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {rating}+
                </button>
            ))}
        </div>
    )
}

// Composant pour les types d'offres
const OffreTypeFilter = ({ selected, onChange }: { selected: string; onChange: (value: string) => void }) => {
    const types = [
        { value: 'all', label: 'Toutes' },
        { value: 'promo', label: 'Promotions' },
        { value: 'last_minute', label: 'Dernière minute' },
        { value: 'early_bird', label: 'Early bird' }
    ]
    
    return (
        <div className="flex flex-wrap gap-2">
            {types.map((type) => (
                <button
                    key={type.value}
                    onClick={() => onChange(type.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        selected === type.value
                            ? 'bg-[#01BDA5] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {type.label}
                </button>
            ))}
        </div>
    )
}

// Composant pour le filtre de réduction minimale
const DiscountFilter = ({ selected, onChange }: { selected: number | null; onChange: (value: number | null) => void }) => {
    const discounts = [10, 20, 30, 40, 50]
    
    return (
        <div className="flex flex-wrap gap-2">
            {discounts.map((discount) => (
                <button
                    key={discount}
                    onClick={() => onChange(selected === discount ? null : discount)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        selected === discount
                            ? 'bg-[#01BDA5] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {discount}%+
                </button>
            ))}
        </div>
    )
}

export default function Filters({ 
    onFilterChange, 
    initialFilters = {}, 
    className = '',
    enabledFilters = ['destination', 'type', 'price', 'availability', 'dates', 'stars', 'rating', 'offre', 'discount']
}: FiltersProps) {
    const t = useTranslations('Filters')
    const [isExpanded, setIsExpanded] = useState(false)
    const [filters, setFilters] = useState<FilterValues>({ ...defaultFilters, ...initialFilters })
    const [destinations, setDestinations] = useState<Destination[]>([])
    const [typeHebergements, setTypeHebergements] = useState<TypeHotel[]>([])

    // Charger les destinations et types d'hébergement
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [destRes, typesRes] = await Promise.all([
                    destinationService.list(),
                    typeHotelService.list()
                ])
                setDestinations(destRes.data)
                setTypeHebergements(typesRes)
            } catch (error) {
                console.error('Erreur chargement filtres:', error)
            }
        }
        fetchData()
    }, [])

    const activeFiltersCount = useMemo(() => {
        let count = 0
        if (filters.destinationId) count++
        if (filters.priceMin || filters.priceMax) count++
        if (filters.availability !== 'all') count++
        if (filters.stars > 0) count++
        if (filters.minRating > 0) count++
        if (filters.typeHebergementId) count++
        if (filters.checkIn || filters.checkOut) count++
        if (filters.offreType !== 'all') count++
        if (filters.discountMin) count++
        return count
    }, [filters])

    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const updateFilter = useCallback(<K extends keyof FilterValues>(key: K, value: FilterValues[K]) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        if (key === 'search') {
            if (searchTimer.current) clearTimeout(searchTimer.current)
            searchTimer.current = setTimeout(() => onFilterChange(newFilters), 350)
        } else {
            onFilterChange(newFilters)
        }
    }, [filters, onFilterChange])

    const updateFilters = useCallback((partial: Partial<FilterValues>) => {
        const newFilters = { ...filters, ...partial }
        setFilters(newFilters)
        onFilterChange(newFilters)
    }, [filters, onFilterChange])

    const clearFilters = () => {
        setFilters(defaultFilters)
        onFilterChange(defaultFilters)
    }

    const formatDate = (date: Date | null): string => {
        if (!date) return ''
        return date.toISOString().split('T')[0]
    }

    return (
        <div className={`bg-white lg:px-16 ${className}`}>
            {/* Barre de recherche + Bouton filtres */}
            <div className="p-4 pb-0">
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Rechercher..."
                            value={filters.search}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            icon={<Search className="w-5 h-5 text-gray-400" />}
                            fullWidth
                            variant="light"
                            placeholderPosition="left"
                        />
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                            isExpanded || activeFiltersCount > 0
                                ? 'bg-[#01BDA5] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">Filtres</span>
                        {activeFiltersCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-white text-[#01BDA5] text-xs rounded-full font-bold">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Panneau des filtres déroulant */}
            {isExpanded && (
                <div className="p-4 pt-4 border-t border-gray-100 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* Destination */}
                        {enabledFilters.includes('destination') && (
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4" />
                                    Destination
                                </label>
                                <select
                                    value={filters.destinationId ?? ''}
                                    onChange={(e) => updateFilter('destinationId', e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#01BDA5] focus:border-transparent"
                                >
                                    <option value="">Toutes les destinations</option>
                                    {destinations.map((dest) => (
                                        <option key={dest.id} value={dest.id}>{dest.nom}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Type d'hébergement */}
                        {enabledFilters.includes('type') && (
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Building2 className="w-4 h-4" />
                                    Type d'hébergement
                                </label>
                                <select
                                    value={filters.typeHebergementId ?? ''}
                                    onChange={(e) => updateFilter('typeHebergementId', e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#01BDA5] focus:border-transparent"
                                >
                                    <option value="">Tous les types</option>
                                    {typeHebergements.map((type) => (
                                        <option key={type.id} value={type.id}>{type.nom}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Prix min - max */}
                        {enabledFilters.includes('price') && (
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <DollarSign className="w-4 h-4" />
                                    Prix par nuit (Ar)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.priceMin ?? ''}
                                        onChange={(e) => updateFilter('priceMin', e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-1/2 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#01BDA5] focus:border-transparent"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.priceMax ?? ''}
                                        onChange={(e) => updateFilter('priceMax', e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-1/2 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#01BDA5] focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Disponibilité */}
                        {enabledFilters.includes('availability') && (
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4" />
                                    Disponibilité
                                </label>
                                <div className="flex gap-2">
                                    {['all', 'disponible', 'complet'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => updateFilter('availability', opt as typeof filters.availability)}
                                            className={`flex-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                                filters.availability === opt
                                                    ? 'bg-[#01BDA5] text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {opt === 'all' ? 'Tous' : opt === 'disponible' ? 'Disponible' : 'Complet'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Intervalle de dates */}
                        {enabledFilters.includes('dates') && (
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4" />
                                    Du - au
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        placeholder="Arrivée"
                                        value={formatDate(filters.checkIn)}
                                        onChange={(e) => updateFilter('checkIn', e.target.value ? new Date(e.target.value) : null)}
                                        className="w-1/2 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#01BDA5] focus:border-transparent"
                                    />
                                    <input
                                        type="date"
                                        placeholder="Départ"
                                        value={formatDate(filters.checkOut)}
                                        onChange={(e) => updateFilter('checkOut', e.target.value ? new Date(e.target.value) : null)}
                                        className="w-1/2 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#01BDA5] focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Nombre d'étoiles */}
                        {enabledFilters.includes('stars') && (
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Star className="w-4 h-4 fill-current" />
                                    Classification
                                </label>
                                <StarFilter selected={filters.stars} onChange={(value) => updateFilter('stars', value)} />
                            </div>
                        )}

                        {/* Note (avis) */}
                        {enabledFilters.includes('rating') && (
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Star className="w-4 h-4" />
                                    Note minimale
                                </label>
                                <RatingFilter selected={filters.minRating} onChange={(value) => updateFilter('minRating', value)} />
                            </div>
                        )}

                        {/* Type d'offre */}
                        {enabledFilters.includes('offre') && (
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Tag className="w-4 h-4" />
                                    Type d'offre
                                </label>
                                <OffreTypeFilter selected={filters.offreType} onChange={(value) => updateFilter('offreType', value as typeof filters.offreType)} />
                            </div>
                        )}

                        {/* Pourcentage de réduction - NOUVEAU */}
                        {enabledFilters.includes('discount') && (
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Percent className="w-4 h-4" />
                                    Réduction minimum
                                </label>
                                <DiscountFilter selected={filters.discountMin} onChange={(value) => updateFilter('discountMin', value)} />
                            </div>
                        )}
                    </div>

                    {/* Filtres actifs (pills) */}
                    {activeFiltersCount > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                            {filters.destinationId && (
                                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#01BDA5]/10 text-[#01BDA5] text-sm">
                                    <MapPin className="w-3 h-3" />
                                    <span>{destinations.find(d => d.id === filters.destinationId)?.nom ?? 'Destination'}</span>
                                    <button onClick={() => updateFilter('destinationId', null)} className="ml-1 hover:opacity-70"><X className="w-3 h-3" /></button>
                                </div>
                            )}
                            {filters.typeHebergementId && (
                                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#01BDA5]/10 text-[#01BDA5] text-sm">
                                    <Building2 className="w-3 h-3" />
                                    <span>{typeHebergements.find(t => t.id === filters.typeHebergementId)?.nom ?? 'Type'}</span>
                                    <button onClick={() => updateFilter('typeHebergementId', null)} className="ml-1 hover:opacity-70"><X className="w-3 h-3" /></button>
                                </div>
                            )}
                            {(filters.priceMin || filters.priceMax) && (
                                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#01BDA5]/10 text-[#01BDA5] text-sm">
                                    <DollarSign className="w-3 h-3" />
                                    <span>{filters.priceMin ?? '0'} – {filters.priceMax ?? '∞'} Ar</span>
                                    <button onClick={() => updateFilters({ priceMin: null, priceMax: null })} className="ml-1 hover:opacity-70"><X className="w-3 h-3" /></button>
                                </div>
                            )}
                            {filters.availability !== 'all' && (
                                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#01BDA5]/10 text-[#01BDA5] text-sm">
                                    <Calendar className="w-3 h-3" />
                                    <span>{filters.availability === 'disponible' ? 'Disponible' : 'Complet'}</span>
                                    <button onClick={() => updateFilter('availability', 'all')} className="ml-1 hover:opacity-70"><X className="w-3 h-3" /></button>
                                </div>
                            )}
                            {filters.stars > 0 && (
                                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#01BDA5]/10 text-[#01BDA5] text-sm">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span>{filters.stars}★ minimum</span>
                                    <button onClick={() => updateFilter('stars', 0)} className="ml-1 hover:opacity-70"><X className="w-3 h-3" /></button>
                                </div>
                            )}
                            {filters.minRating > 0 && (
                                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#01BDA5]/10 text-[#01BDA5] text-sm">
                                    <Star className="w-3 h-3" />
                                    <span>Note ≥ {filters.minRating}</span>
                                    <button onClick={() => updateFilter('minRating', 0)} className="ml-1 hover:opacity-70"><X className="w-3 h-3" /></button>
                                </div>
                            )}
                            {(filters.checkIn || filters.checkOut) && (
                                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#01BDA5]/10 text-[#01BDA5] text-sm">
                                    <Calendar className="w-3 h-3" />
                                    <span>{filters.checkIn?.toLocaleDateString('fr-FR') ?? '?'} → {filters.checkOut?.toLocaleDateString('fr-FR') ?? '?'}</span>
                                    <button onClick={() => updateFilters({ checkIn: null, checkOut: null })} className="ml-1 hover:opacity-70"><X className="w-3 h-3" /></button>
                                </div>
                            )}
                            {filters.offreType !== 'all' && (
                                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#01BDA5]/10 text-[#01BDA5] text-sm">
                                    <Tag className="w-3 h-3" />
                                    <span>{filters.offreType === 'promo' ? 'Promotions' : filters.offreType === 'last_minute' ? 'Dernière minute' : 'Early bird'}</span>
                                    <button onClick={() => updateFilter('offreType', 'all')} className="ml-1 hover:opacity-70"><X className="w-3 h-3" /></button>
                                </div>
                            )}
                            {filters.discountMin && (
                                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#01BDA5]/10 text-[#01BDA5] text-sm">
                                    <Percent className="w-3 h-3" />
                                    <span>≥ {filters.discountMin}% de réduction</span>
                                    <button onClick={() => updateFilter('discountMin', null)} className="ml-1 hover:opacity-70"><X className="w-3 h-3" /></button>
                                </div>
                            )}
                            <button onClick={clearFilters} className="px-3 py-1 text-sm text-gray-500 hover:text-red-500 transition-colors">
                                Tout effacer
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}