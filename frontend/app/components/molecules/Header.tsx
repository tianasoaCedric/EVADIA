'use client'

import { useState, useEffect } from 'react'
import ToggleLangue from '../ui/ToggleLangue'
import Avatar from '../ui/Avatar'
import Input from '../ui/Input'
import MenuFullscreen from './MenuFullscreen'

interface HeaderProps {
    /** Langue actuelle */
    currentLang?: 'FR' | 'EN'
    /** Callback changement de langue */
    onLanguageChange?: (lang: 'FR' | 'EN') => void
    /** État de connexion de l'utilisateur */
    isLoggedIn?: boolean
    /** Nom de l'utilisateur */
    userName?: string | null
    /** Photo de l'utilisateur */
    userPhoto?: string | null
    /** Callback clic sur le menu */
    onMenuClick?: () => void
    /** Callback clic sur le logo */
    onLogoClick?: () => void
    /** Callback clic sur la recherche */
    onSearchClick?: () => void
    /** Callback clic sur l'avatar */
    onAvatarClick?: () => void
    /** Afficher le champ de recherche (mobile vs desktop) */
    showSearchInput?: boolean
    /** Mode du header (default ou dark) */
    theme?: 'default' | 'dark'
}

const Header = ({
    currentLang = 'FR',
    onLanguageChange,
    isLoggedIn = false,
    userName = null,
    userPhoto = null,
    onMenuClick,
    onLogoClick,
    onSearchClick,
    onAvatarClick,
    showSearchInput = false,
    theme = 'default'
}: HeaderProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [isMobile, setIsMobile] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const [isSliding, setIsSliding] = useState(false)

    // Détecter la taille de l'écran pour le responsive
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768) // 768px = breakpoint md
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const handleMenuClick = () => {
        if (!isMenuOpen) {
            // Ouverture du menu
            setIsSliding(true)
            setIsMenuOpen(true)
            setTimeout(() => setIsSliding(false), 300)
        } else {
            // Fermeture du menu
            setIsSliding(true)
            setIsMenuOpen(false)
            setTimeout(() => setIsSliding(false), 300)
        }
        onMenuClick?.()
    }

    const handleMenuClose = () => {
        setIsMenuOpen(false)
    }

    const handleSearchToggle = () => {
        setIsSearchOpen(!isSearchOpen)
        onSearchClick?.()
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Recherche:', searchValue)
    }

    /**
     * Styles selon le thème (default/dark)
     */
    const themeStyles = {
        default: {
            header: "bg-transparent",  // Changé : fond transparent
            menuButton: "text-white hover:text-gray-300",
            logoText: "text-gray-800",
            searchButton: "text-white hover:text-gray-300 hover:bg-white/10",
            searchInput: "default",
            iconColor: "white"
        },
        dark: {
            header: "bg-gray-900/80 backdrop-blur-md border-b border-gray-800",
            menuButton: "text-gray-800 hover:text-gray-300",
            logoText: "text-white",
            searchButton: "text-gray-800 hover:text-gray-300 hover:bg-gray-800",
            searchInput: "default",
            iconColor: "black"
        }
    }

    const currentTheme = themeStyles[theme]

    return (
        <>
            {/* Menu plein écran */}
            <MenuFullscreen
                isOpen={isMenuOpen}
                onClose={handleMenuClose}
                theme={theme === 'default' ? 'light' : 'dark'}
            />
            <header className={`fixed top-0 left-0 right-0 z-50 w-full ${currentTheme.header}`}>
                {/* Conteneur qui glisse de bas en haut */}
                <div className={`
                    transition-transform duration-300 ease-out
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
                                        variant={theme === 'default' ? 'default' : 'dark'}
                                        currentLang={currentLang}
                                        onToggle={onLanguageChange}
                                        size={isMenuOpen ? 'sm' : 'md'}
                                    />
                                )}
                            </div>

                            {/* Partie centrale : Logo */}
                            <div
                                onClick={onLogoClick}
                                className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer"
                            >
                                <div className="flex items-center justify-center">
                                    {/* Logo pour mobile */}
                                    <img
                                        src={`/Evadia_Logo 4${theme === 'dark' ? '_dark' : ''}.png`}
                                        alt="Evadia"
                                        className="block md:hidden"
                                        width={40}
                                        height={40}
                                    />
                                    {/* Logo pour desktop */}
                                    <img
                                        src={`/Evadia_Logo 2${theme === 'dark' ? '_dark' : ''}.png`}
                                        alt="Evadia"
                                        className="hidden md:block"
                                        width={180}
                                        height={180}
                                    />
                                </div>
                            </div>

                            {/* Partie droite : Recherche + Avatar */}
                            <div className="flex items-center gap-3 md:gap-4">

                                {/* Icône de recherche */}
                                <button
                                    onClick={handleSearchToggle}
                                    className={`p-2 transition-colors duration-200 rounded-full cursor-pointer ${currentTheme.searchButton}`}
                                    aria-label="Rechercher"
                                >
                                    <svg
                                        className="w-5 h-5 md:w-6 md:h-6"
                                        fill="none"
                                        stroke={currentTheme.iconColor}
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </button>

                                {/* Avatar utilisateur */}
                                <Avatar
                                    variant={theme === 'default' ? 'default' : 'dark'}
                                    photoUrl={userPhoto}
                                    userName={isLoggedIn ? userName : null}
                                    size={isMenuOpen ? 'sm' : 'md'}
                                    onClick={onAvatarClick}
                                />
                            </div>
                        </div>

                        {/* Champ de recherche expansible */}
                        {showSearchInput && isSearchOpen && (
                            <div className="py-3 border-t border-white/20 animate-in slide-in-from-top-2 duration-200 ">
                                <form onSubmit={handleSearchSubmit} className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Rechercher..."
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        icon={
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        }
                                        fullWidth
                                        variant={currentTheme.searchInput === 'light' ? 'light' : 'default'}
                                        placeholderPosition="left"
                                    />
                                </form>
                            </div>
                        )}
                    </div>
                    <div className={`
                        absolute bottom-0 left-0 right-0 h-[1px] bg-white/50
                        transition-all duration-300 ease-out
                        ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-2px]'}
                    `} />
                </div>
            </header>
        </>
    )
}

export default Header