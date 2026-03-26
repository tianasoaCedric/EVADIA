'use client'

import { useState, ReactNode } from 'react'
import Image from 'next/image'

interface AvatarProps {
  /** URL de la photo de profil (si disponible) */
  photoUrl?: string | null
  /** Nom de l'utilisateur pour générer l'initiale */
  userName?: string | null
  /** Taille de l'avatar */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Variante de style (couleur de fond) */
  variant?: 'default' | 'dark'
  /** Statut en ligne */
  isOnline?: boolean
  /** État de chargement */
  isLoading?: boolean
  /** Fonction callback au clic */
  onClick?: () => void
  /** Classes CSS supplémentaires */
  className?: string
}

/**
 * Composant Avatar
 * Affiche :
 * - Icône par défaut si non connecté
 * - Initiale si connecté sans photo
 * - Photo si connecté avec photo
 */
const Avatar = ({
  photoUrl,
  userName,
  size = 'md',
  variant = 'default',
  isOnline = false,
  isLoading = false,
  onClick,
  className = ''
}: AvatarProps) => {
  const [imageError, setImageError] = useState(false)

  /**
   * Tailles disponibles
   */
  const sizeStyles = {
    xs: {
      container: "w-6 h-6",
      icon: "w-3 h-3",
      text: "text-xs",
      online: "w-1.5 h-1.5"
    },
    sm: {
      container: "w-8 h-8",
      icon: "w-4 h-4",
      text: "text-sm",
      online: "w-2 h-2"
    },
    md: {
      container: "w-10 h-10",
      icon: "w-5 h-5",
      text: "text-base",
      online: "w-2.5 h-2.5"
    },
    lg: {
      container: "w-12 h-12",
      icon: "w-6 h-6",
      text: "text-lg",
      online: "w-3 h-3"
    },
    xl: {
      container: "w-16 h-16",
      icon: "w-8 h-8",
      text: "text-xl",
      online: "w-3.5 h-3.5"
    }
  }

  /**
   * Styles de fond selon la variante
   */
  const variantStyles = {
    default: {
      background: "bg-[#F5F5F5]/20",
      iconColor: "text-[#F5F5F5]",
      border: "border border-white/20"
    },
    dark: {
      background: "bg-[#F5F5F5]/20",
      iconColor: "text-gray-800",
      border: "border-transparent"
    }
  }

  /**
   * Récupère l'initiale du nom de l'utilisateur
   */
  const getInitial = (): string => {
    if (!userName || userName.trim() === '') return '?'
    // Prend la première lettre du prénom ou du nom
    const nameParts = userName.trim().split(' ')
    if (nameParts.length >= 2) {
      // Prend la première lettre du prénom et la première lettre du nom
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase()
    }
    // Sinon prend la première lettre
    return userName[0].toUpperCase()
  }

  /**
   * Détermine ce qu'il faut afficher
   * 1. Si chargement -> afficher un loader
   * 2. Si photo et pas d'erreur -> afficher la photo
   * 3. Si utilisateur connecté (userName) -> afficher l'initiale
   * 4. Sinon -> afficher l'icône par défaut
   */
  const renderContent = () => {
    // État de chargement
    if (isLoading) {
      return (
        <div className="animate-pulse">
          <div className={`rounded-full ${variantStyles[variant].background} ${sizeStyles[size].container}`} />
        </div>
      )
    }

    // Cas 1 : Photo de profil disponible et pas d'erreur de chargement
    if (photoUrl && !imageError) {
      return (
        <Image
          src={photoUrl}
          alt={userName || 'Avatar'}
          fill
          className="object-cover rounded-full"
          onError={() => setImageError(true)}
          sizes={`(max-width: 768px) ${parseInt(sizeStyles[size].container) * 4}px, ${parseInt(sizeStyles[size].container) * 4}px`}
        />
      )
    }

    // Cas 2 : Utilisateur connecté (nom disponible) -> afficher l'initiale
    if (userName && userName.trim() !== '') {
      return (
        <span className={`
          font-medium
          ${variantStyles[variant].iconColor}
          ${sizeStyles[size].text}
        `}>
          {getInitial()}
        </span>
      )
    }

    // Cas 3 : Utilisateur non connecté -> afficher l'icône par défaut
    return (
      <svg 
        className={`
          ${variantStyles[variant].iconColor}
          ${sizeStyles[size].icon}
        `}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
        />
      </svg>
    )
  }

  return (
    <div 
      className={`
        relative
        flex items-center justify-center
        rounded-full
        ${variantStyles[variant].background}
        ${variantStyles[variant].border}
        ${sizeStyles[size].container}
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {renderContent()}
      
      {/* Indicateur de statut en ligne */}
      {isOnline && (
        <span className={`
          absolute bottom-0 right-0
          rounded-full
          bg-green-500
          ring-2 ring-white
          ${sizeStyles[size].online}
        `} />
      )}
    </div>
  )
}

export default Avatar