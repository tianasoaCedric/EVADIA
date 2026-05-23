'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { typeHotelService, destinationService } from '@/lib/services'
import { createSlug } from '@/lib/slug'

interface MenuFullscreenProps {
    isOpen: boolean
    onClose: () => void
    theme?: 'light' | 'dark'
}

interface MenuColumn {
    title: string
    items: { label: string; href: string }[]
}

type MenuData = [Awaited<ReturnType<typeof typeHotelService.list>>, Awaited<ReturnType<typeof destinationService.list>>]

// Fetch démarre dès que le module se charge (pas au montage du composant)
let _menuDataPromise: Promise<MenuData> | null = null
function prefetchMenuData(): Promise<MenuData> {
    if (!_menuDataPromise) {
        _menuDataPromise = Promise.all([
            typeHotelService.list(),
            destinationService.list(),
        ]).catch(() => [[], { data: [] }] as unknown as MenuData)
    }
    return _menuDataPromise
}
if (typeof window !== 'undefined') prefetchMenuData()

function buildMenuStructure(types: MenuData[0], destResponse: MenuData[1]): MenuColumn[] {
    return [
        {
            title: 'Hébergements',
            items: [
                { label: 'Tous les hébergements', href: '/hebergement' },
                ...types.map(t => ({ label: t.nom, href: `/hebergement/${createSlug(t.id, t.nom)}` })),
            ]
        },
        {
            title: 'Destinations',
            items: [
                { label: 'Toutes les destinations', href: '/destination' },
                ...destResponse.data.map(d => ({ label: d.nom, href: `/destination/${createSlug(d.id, d.nom)}` })),
            ]
        },
        { title: 'Offres',    items: [{ label: 'Toutes les offres', href: '/offre' }] },
        { title: 'Découvrir', items: [{ label: 'Découvrir Madagascar', href: '/decouvrir' }] },
    ]
}

const DEFAULT_MENU: MenuColumn[] = [
    { title: 'Hébergements', items: [] },
    { title: 'Destinations',  items: [] },
    { title: 'Offres',        items: [{ label: 'Toutes les offres', href: '/offre' }] },
    { title: 'Découvrir',    items: [{ label: 'Découvrir Madagascar', href: '/decouvrir' }] },
]

const MenuFullscreen = ({ isOpen, onClose, theme = 'light' }: MenuFullscreenProps) => {
    const [menuStructure, setMenuStructure] = useState<MenuColumn[]>(DEFAULT_MENU)

    useEffect(() => {
        prefetchMenuData().then(([types, destResponse]) => {
            setMenuStructure(buildMenuStructure(types, destResponse))
        })
    }, [])

    // État pour les sections ouvertes/déroulées sur mobile
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

    // Empêcher le scroll quand le menu est ouvert
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
            // Réinitialiser les sections ouvertes quand on ferme
            setOpenSections({})
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    // Fermer avec la touche Echap
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    // Basculer l'ouverture d'une section
    const toggleSection = (title: string) => {
        setOpenSections(prev => ({
            ...prev,
            [title]: !prev[title]
        }))
    }

    return (
        <>
            {/* Overlay du menu */}
            <div
                className={`
                    fixed inset-0 z-40 transition-all duration-500 ease-in-out
                    ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
                    ${theme === 'light' ? 'bg-black/75 backdrop-blur-md' : 'bg-gray-900/95 backdrop-blur-md'}
                `}
                onClick={onClose}
            >
                {/* Contenu du menu avec scroll si nécessaire */}
                <div
                    className={`
                        h-full overflow-y-auto
                        transform transition-all duration-500 delay-200
                        ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
                    `}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="min-h-full flex items-center justify-center py-16 md:py-8">
                        <div className="container mx-auto px-6 md:px-16">
                            
                            {/* Version Desktop : grille en colonnes */}
                            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                                {menuStructure.map((column, colIndex) => (
                                    <div
                                        key={column.title}
                                        className="space-y-4 md:space-y-6"
                                        style={{
                                            animation: isOpen ? `fadeInUp 0.5s ease-out ${colIndex * 0.1}s forwards` : 'none',
                                            opacity: 0,
                                            transform: 'translateY(20px)'
                                        }}
                                    >
                                        {/* Titre de la colonne - Desktop */}
                                        <h3 className={`
                                            text-lg md:text-xl font-semibold uppercase tracking-wider
                                            text-[#01BDA5]
                                            border-b-2 border-[#01BDA5] inline-block pb-2
                                        `}>
                                            {column.title}
                                        </h3>
                                        
                                        {/* Liste des liens - Desktop */}
                                        <ul className="space-y-3 md:space-y-4">
                                            {column.items.map((item) => (
                                                <li key={item.href}>
                                                    <Link
                                                        href={item.href}
                                                        onClick={onClose}
                                                        className={`
                                                            block text-base md:text-lg lg:text-xl
                                                            transition-all duration-300 hover:translate-x-2
                                                            ${theme === 'light'
                                                                ? 'text-gray-200 hover:text-[#01BDA5]'
                                                                : 'text-gray-300 hover:text-[#01BDA5]'
                                                            }
                                                        `}
                                                    >
                                                        {item.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* Version Mobile : accordéon */}
                            <div className="md:hidden space-y-4">
                                {menuStructure.map((column, colIndex) => {
                                    const isOpenSection = openSections[column.title]
                                    
                                    return (
                                        <div
                                            key={column.title}
                                            className="border-b border-white/20 pb-3"
                                            style={{
                                                animation: isOpen ? `fadeInUp 0.5s ease-out ${colIndex * 0.1}s forwards` : 'none',
                                                opacity: 0,
                                                transform: 'translateY(20px)'
                                            }}
                                        >
                                            {/* Bouton d'accordéon */}
                                            <button
                                                onClick={() => toggleSection(column.title)}
                                                className="w-full flex items-center justify-between py-4"
                                            >
                                                <h3 className={`
                                                    text-xl font-semibold uppercase tracking-wider
                                                    text-[#01BDA5]
                                                `}>
                                                    {column.title}
                                                </h3>
                                                
                                                <ChevronDown className={`w-5 h-5 text-[#01BDA5] transition-transform duration-300 ${isOpenSection ? 'rotate-180' : ''}`} />
                                            </button>
                                            
                                            {/* Liste des liens (accordéon) */}
                                            <div
                                                className={`
                                                    overflow-hidden transition-all duration-300 ease-in-out
                                                    ${isOpenSection ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                                                `}
                                            >
                                                <ul className="space-y-3 pb-4 pl-2">
                                                    {column.items.map((item) => (
                                                        <li key={item.href}>
                                                            <Link
                                                                href={item.href}
                                                                onClick={onClose}
                                                                className={`
                                                                    block text-lg py-2
                                                                    transition-all duration-300 hover:translate-x-2
                                                                    ${theme === 'light'
                                                                        ? 'text-gray-200 hover:text-[#01BDA5]'
                                                                        : 'text-gray-300 hover:text-[#01BDA5]'
                                                                    }
                                                                `}
                                                            >
                                                                {item.label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    )
}

export default MenuFullscreen