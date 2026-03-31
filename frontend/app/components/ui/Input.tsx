'use client'

import { useState, forwardRef, InputHTMLAttributes, ReactNode } from 'react'
// import { clsx } from 'clsx' // Optionnel, mais recommandé pour gérer les classes conditionnelles

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Icône à afficher à gauche du champ */
  icon?: ReactNode
  /** Texte du placeholder */
  placeholder?: string
  /** Variante de style */
  variant?: 'default' | 'light'
  /** Position du placeholder */
  placeholderPosition?: 'right' | 'center' | 'left'
  /** État d'erreur */
  error?: string
  /** État de succès */
  success?: boolean
  /** État désactivé */
  disabled?: boolean
  /** Classes CSS supplémentaires */
  className?: string
  /** Taille du champ */
  sizes?: 'small' | 'medium' | 'large'
  /** Largeur complète */
  fullWidth?: boolean


}

/**
 * Composant Input personnalisé avec icône et styles arrondis
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    icon,
    placeholder = "Saisissez du texte...",
    variant = 'default',
    placeholderPosition = 'center',
    error,
    success,
    disabled = false,
    className = "",
    fullWidth = false,
    value,
    onChange,
    type = "text",
    sizes = "small",
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    /**
     * Styles selon la variante
     * - light : fond #F5F5F5 avec opacité 100%, texte gris foncé
     * - default : fond #F5F5F5 avec opacité 20%, texte #F5F5F5
     */
    const variantStyles = {
      light: {
        background: "bg-[#F5F5F5]",
        backgroundHover: "hover:bg-[#E8E8E8]",
        text: "font-light text-gray-800",           // Texte gris foncé
        placeholder: "font-light placeholder:text-gray-800",
        iconColor: "font-light text-gray-800",      // Icône grise pour le mode light
        border: "border border-white/10",
        focusRing: "focus:ring-1 focus:ring-[#F5F5F5] focus:ring-opacity-50"
      },
      default: {
        background: "bg-[#F5F5F5]/20",   // 20% d'opacité
        backgroundHover: "hover:bg-[#F5F5F5]/30",
        text: "font-light text-[#F5F5F5]",          // Texte blanc/crème
        placeholder: "font-light placeholder:text-[#F5F5F5]",
        iconColor: "text-[#F5F5F5]",     // Icône de la même couleur que le texte
        border: "border border-white/10",
        focusRing: "focus:ring-1 focus:ring-[#F5F5F5] focus:ring-opacity-50"
      }
    }

    /**
     * Styles pour le placeholder selon sa position
     */
    const placeholderStyles = {
      left: "text-left",
      center: "text-center",
      right: "text-right"
    }

    const sizeStyles: Record<string, string> = {
    small: "px-3 py-1 text-sm",     // Petit : moins d'espacement
    medium: "px-6 py-2 text-base",  // Moyen : espacement standard
    large: "px-8 py-3 text-lg"      // Grand : plus d'espacement
  }

    /**
     * Styles de padding selon la présence de l'icône
     */
    const paddingStyles = icon 
      ? "pl-10 pr-4"  // Espace pour l'icône à gauche
      : "px-4"        // Padding standard

    /**
     * Styles de base du conteneur
     */
    const containerStyles = `
      relative
      ${fullWidth ? 'w-full' : 'w-auto'}
      ${className}
    `

    /**
     * Styles de l'input
     */
    const inputStyles = `
      ${fullWidth ? 'w-full' : 'w-auto'}
      rounded-full
      py-2.5
      ${paddingStyles}
      ${variantStyles[variant].background}
      ${!disabled && variantStyles[variant].backgroundHover}
      ${variantStyles[variant].text}
      ${variantStyles[variant].placeholder}
      ${variantStyles[variant].border}
      ${!disabled && variantStyles[variant].focusRing}
      ${placeholderStyles[placeholderPosition]}
      ${sizeStyles[sizes]}
      transition-all duration-200
      outline-none
      font-sans
      font-medium
      text-base
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
      ${error ? 'ring-2 ring-red-500 ring-opacity-50' : ''}
      ${success ? 'ring-2 ring-green-500 ring-opacity-50' : ''}
    `

    /**
     * Styles de l'icône - maintenant synchronisée avec la couleur du texte
     */
    const iconStyles = `
      absolute
      left-3
      top-1/2
      transform -translate-y-1/2
      flex items-center justify-center
      ${variantStyles[variant].iconColor}
      transition-all duration-200
      ${disabled ? 'opacity-40' : 'opacity-70'}
      ${isFocused || isHovered ? 'opacity-100 scale-105' : ''}
      pointer-events-none
    `

    /**
     * Styles du message d'erreur/succès
     */
    const messageStyles = `
      mt-1
      text-sm
      font-medium
      transition-all duration-200
      ${error ? 'text-red-500' : ''}
      ${success ? 'text-green-500' : ''}
    `

    return (
      <div className={containerStyles}>
        <div className="relative">
          {/* Icône à gauche avec la même couleur que le texte */}
          {icon && (
            <div className={iconStyles}>
              {icon}
            </div>
          )}
          
          {/* Champ input */}
          <input
            ref={ref}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={inputStyles}
            {...props}
          />
        </div>
        
        {/* Message d'erreur ou de succès */}
        {(error || success) && (
          <div className={messageStyles}>
            {error || (success && "✓ Valide")}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input