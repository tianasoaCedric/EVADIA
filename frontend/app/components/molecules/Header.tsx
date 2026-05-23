'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ToggleLangue from '../ui/ToggleLangue'
import Avatar from '../ui/Avatar'
import Input from '../ui/Input'
import { ChevronDown, Search } from 'lucide-react'
import { useDevise } from '../../context/DeviseContext'
import SearchSuggestions, { Suggestion } from '../ui/SearchSuggestions'
import MenuFullscreen from './MenuFullscreen'

interface HeaderProps {
    /** Langue actuelle */
    currentLang?: 'FR' | 'EN'
    /** Callback changement de langue */
    onLanguageChange?: (lang: 'FR' | 'EN') => void
    /** État de connexion de l'utilisateur */
    isLoggedIn?: boolean
    /** Callback clic sur le menu */
    onMenuClick?: () => void
    /** Callback clic sur la recherche */
    onSearchClick?: () => void
    /** Mode du header (default ou dark) */
    theme?: 'default' | 'dark'
    /** Callback changement de devise */
    onDeviseChange?: (devise: string) => void
}

// Liste des devises disponibles
const devises = [
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'MGA', name: 'Ariary', symbol: 'Ar' },
]

const Header = ({
    currentLang = 'FR',
    onLanguageChange,
    onMenuClick,
    onSearchClick,
    theme = 'default',
    onDeviseChange
}: HeaderProps) => {
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [isMobile, setIsMobile] = useState(false)
    const [isSliding, setIsSliding] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [deviseOpen, setDeviseOpen] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const { devise: selectedDevise, setDevise } = useDevise()
    const deviseRef = useRef<HTMLDivElement>(null)
    const searchContainerRef = useRef<HTMLDivElement>(null)

    // Fermer le dropdown devise et les suggestions si clic extérieur
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (deviseRef.current && !deviseRef.current.contains(e.target as Node)) {
                setDeviseOpen(false)
            }
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Détecter le scroll
    useEffect(() => {
        let rafId: number
        const handleScroll = () => {
            cancelAnimationFrame(rafId)
            rafId = requestAnimationFrame(() => {
                setIsScrolled(window.scrollY > 50)
            })
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            cancelAnimationFrame(rafId)
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    // Détecter la taille de l'écran pour le responsive
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 767px)')
        const update = () => setIsMobile(mq.matches)
        update()
        mq.addEventListener('change', update)
        return () => mq.removeEventListener('change', update)
    }, [])

    // Déterminer le thème actif
    const getActiveTheme = () => {
        if (isMenuOpen) return 'default'
        if (isScrolled) return 'dark'
        return theme
    }

    const activeTheme = getActiveTheme()

    const handleMenuClick = () => {
        setIsSliding(true)
        setIsMenuOpen(prev => !prev)
        setTimeout(() => setIsSliding(false), 300)
        onMenuClick?.()
    }

    const handleMenuClose = () => {
        setIsMenuOpen(false)
    }

    const handleSearchToggle = () => {
        setIsSearchOpen(!isSearchOpen)
        setShowSuggestions(false)
        setSearchValue('')
        onSearchClick?.()
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchValue.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchValue)}`)
            setIsSearchOpen(false)
            setShowSuggestions(false)
            setSearchValue('')
        }
    }

    const handleSelectSuggestion = (suggestion: Suggestion) => {
        setSearchValue('')
        setIsSearchOpen(false)
        setShowSuggestions(false)
        router.push(suggestion.href)
    }

    const handleDeviseChange = (code: string) => {
        setDevise(code as 'EUR' | 'MGA')
        setDeviseOpen(false)
        onDeviseChange?.(code)
    }

    /**
     * Styles selon le thème (default/dark)
     */
    const themeStyles = {
        default: {
            header: "bg-transparent",
            menuButton: "text-white hover:text-gray-300",
            logoText: "text-gray-800",
            searchButton: "text-white hover:text-gray-300 hover:bg-white/10",
            searchInput: "default",
            iconColor: "white",
            border: "border-transparent",
            deviseButton: "text-white hover:text-gray-300"
        },
        dark: {
            header: "bg-white/95 backdrop-blur-md border-gray-200",
            menuButton: "text-gray-800 hover:text-[#01BDA5]",
            logoText: "text-white",
            searchButton: "text-gray-800 hover:text-[#01BDA5] hover:bg-gray-100",
            searchInput: "light",
            iconColor: "black",
            border: "border-gray-200",
            deviseButton: "text-gray-800 hover:text-[#01BDA5]"
        }
    }

    const currentTheme = themeStyles[activeTheme]

    return (
        <>
            {/* Menu plein écran */}
            <MenuFullscreen
                isOpen={isMenuOpen}
                onClose={handleMenuClose}
                theme="light"
            />

            <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${currentTheme.header} ${isScrolled ? 'shadow-sm' : ''}`}>
                {/* Conteneur qui glisse de bas en haut */}
                <div className={`
                    transition-transform duration-300 ease-out
                    ${isSliding ? 'shadow-md':''}
                    ${isSliding && isMenuOpen ? '-translate-y-2' : 'translate-y-0'}
                `}>
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between h-16 md:h-20">

                            {/* Partie gauche : MENU (devient X quand ouvert) + ToggleLangue */}
                            <div className="flex items-center gap-4 md:gap-6">
                                {/* Bouton MENU / X - change selon l'état du menu */}
                                <button
                                    onClick={handleMenuClick}
                                    className={`flex items-center gap-2 transition-colors duration-200 font-medium group ${currentTheme.menuButton} cursor-pointer`}
                                    aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                                >
                                    {/* cône X quand menu ouvert */}
                                    {isMenuOpen && (
                                        <svg
                                            className="w-5 h-5 md:w-6 md:h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    )}
                                    {/* Icône MENU quand fermé */}
                                    {isMobile && !isMenuOpen && (<svg
                                        className=" w-5 h-5 lg:w-6 lg:h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>)}

                                    <span className="hidden sm:inline text-sm md:text-base">
                                        {isMenuOpen ? '' : 'MENU'}
                                    </span>
                                </button>

                                {/* Toggle Langue - caché sur mobile */}
                                {!isMobile && (
                                <ToggleLangue
                                    variant={activeTheme === 'default' ? 'default' : 'dark'}
                                    currentLang={currentLang}
                                    onToggle={onLanguageChange}
                                    size={isMenuOpen ? 'sm' : 'md'}
                                />
                            )}
                            </div>

                            {/* Partie centrale : Logo */}
                            <Link
                                href="/"
                                className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer"
                            >
                                <div className="flex items-center justify-center">
                                    {/* Logo pour mobile */}
                                    <Image
                                        src={`/Evadia_Logo 4${activeTheme === 'dark' ? '_dark' : ''}.png`}
                                        alt="Evadia"
                                        className="block md:hidden"
                                        width={40}
                                        height={40}
                                        priority
                                    />
                                    {/* Logo pour desktop */}
                                    <Image
                                        src={`/Evadia_Logo 2${activeTheme === 'dark' ? '_dark' : ''}.png`}
                                        alt="Evadia"
                                        className="hidden md:block"
                                        width={180}
                                        height={40}
                                        style={{ width: 'auto', height: '40px' }}
                                        priority
                                    />
                                </div>
                            </Link>

                            {/* Partie droite : Recherche + Devise + Avatar */}
                            <div className="flex items-center gap-3 md:gap-4">

                                {/* Icône de recherche */}
                                <button
                                    onClick={handleSearchToggle}
                                    className={`p-2 transition-all duration-200 rounded-full cursor-pointer ${currentTheme.searchButton}`}
                                    aria-label="Rechercher"
                                >
                                    <Search className="w-5 h-5 md:w-6 md:h-6" stroke={currentTheme.iconColor} />
                                </button>

                                {/* Sélecteur de devise */}
                                <div className="relative" ref={deviseRef}>
                                    <button
                                        onClick={() => setDeviseOpen(!deviseOpen)}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded-full transition-colors duration-200 ${currentTheme.deviseButton}`}
                                        aria-label="Changer de devise"
                                    >
                                        <span className="text-sm md:text-base font-medium">{selectedDevise}</span>
                                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${deviseOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {deviseOpen && (
                                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                                            {devises.map((dev) => (
                                                <button
                                                    key={dev.code}
                                                    onClick={() => handleDeviseChange(dev.code)}
                                                    className={`flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                                        selectedDevise === dev.code ? 'text-[#01BDA5]' : 'text-gray-700'
                                                    }`}
                                                >
                                                    <span>{dev.code}</span>
                                                    <span className="text-xs text-gray-400">{dev.symbol}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Avatar utilisateur */}
                                 <Avatar
                                    variant={activeTheme === 'default' ? 'default' : 'dark'}
                                    size={isMenuOpen ? 'sm' : 'md'}
                                />
                            </div>
                        </div>

                        {/* Champ de recherche expansible */}
                        {isSearchOpen && (
                            <div className="relative py-3 border-t border-white/20 transition-all duration-300 ease-out" ref={searchContainerRef}>
                                <form onSubmit={handleSearchSubmit} className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Rechercher..."
                                        value={searchValue}
                                        onChange={(e) => {
                                            setSearchValue(e.target.value)
                                            setShowSuggestions(true)
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        icon={<Search className="w-5 h-5" />}
                                        fullWidth
                                        variant={activeTheme === 'dark' ? 'light' : 'default'}
                                        placeholderPosition="left"
                                    />
                                </form>
                                
                                {/* Suggestions de recherche */}
                                <SearchSuggestions
                                    searchQuery={searchValue}
                                    isOpen={showSuggestions && searchValue.length > 0}
                                    onSelect={handleSelectSuggestion}
                                    onClose={() => setShowSuggestions(false)}
                                />
                            </div>
                        )}
                    </div>
                    <div className={`
                        absolute bottom-0 left-0 right-0 h-[1px] 
                        transition-all duration-300 ease-out
                        ${isMenuOpen 
                            ? 'opacity-100 translate-y-0 bg-white/50' 
                            : 'opacity-0 translate-y-[-2px]'
                        }
                        ${activeTheme === 'dark' && !isMenuOpen ? 'bg-gray-200' : ''}
                    `} />
                </div>
            </header>
        </>
    )
}

export default Header