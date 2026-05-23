'use client'

import { useState, forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

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
  /** Afficher le bouton d'affichage du mot de passe (pour type password) */
  showPasswordToggle?: boolean
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
    showPasswordToggle = true,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Déterminer le type réel de l'input
    const isPasswordType = type === 'password'
    const inputType = isPasswordType && showPassword ? 'text' : type

    /**
     * Styles selon la variante
     */
    const variantStyles = {
      light: {
        background: "bg-[#F5F5F5]",
        backgroundHover: "hover:bg-[#E8E8E8]",
        text: "font-light text-gray-800",
        placeholder: "font-light placeholder:text-gray-800 placeholder:text-xs",
        iconColor: "font-light text-gray-800",
        eyeColor: "text-gray-500 hover:text-gray-700",
        border: "border border-white/10",
        focusRing: "focus:ring-1 focus:ring-[#F5F5F5] focus:ring-opacity-50"
      },
      default: {
        background: "bg-[#F5F5F5]/20",
        backgroundHover: "hover:bg-[#F5F5F5]/30",
        text: "font-light text-[#F5F5F5]",
        placeholder: "font-light placeholder:text-[#F5F5F5] placeholder:text-xs",
        iconColor: "text-[#F5F5F5]",
        eyeColor: "text-white/70 hover:text-white",
        border: "border border-white/10",
        focusRing: "focus:ring-1 focus:ring-[#F5F5F5] focus:ring-opacity-50"
      }
    }

    const placeholderStyles = {
      left: "text-left",
      center: "text-center",
      right: "text-right"
    }

    const sizeStyles: Record<string, string> = {
      small: "px-3 py-1 text-sm",
      medium: "px-6 py-2 text-base",
      large: "px-8 py-3 text-lg"
    }

    const getPaddingStyles = () => {
      let padding = ""
      if (icon) {
        padding = "pl-12"
      } else {
        padding = "pl-4"
      }
      if (isPasswordType && showPasswordToggle) {
        padding += " pr-10"
      } else {
        padding += " pr-4"
      }
      return padding
    }

    const containerStyles = `
      relative
      ${fullWidth ? 'w-full' : 'w-auto'}
      ${className}
    `

    // Classes pour masquer l'icône native du navigateur sur les champs password
    const hideNativePasswordIcon = `
      [&::-ms-reveal]:hidden
      [&::-ms-clear]:hidden
      [&::-webkit-clear-button]:hidden
      [&::-webkit-credentials-auto-fill-button]:hidden
      [&::-webkit-textfield-decoration-container]:hidden
      [&::-webkit-search-cancel-button]:hidden
      [&::-webkit-search-decoration]:hidden
      [&::-webkit-search-results-button]:hidden
      [&::-webkit-search-results-decoration]:hidden
    `

    const inputStyles = `
      ${fullWidth ? 'w-full' : 'w-auto'}
      rounded-full
      py-2.5
      ${getPaddingStyles()}
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
      ${isPasswordType ? hideNativePasswordIcon : ''}
    `

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

    const eyeButtonStyles = `
      absolute
      right-3
      top-1/2
      transform -translate-y-1/2
      flex items-center justify-center
      cursor-pointer
      transition-all duration-200
      hover:scale-110
      ${variantStyles[variant].eyeColor}
      focus:outline-none
    `

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
          {icon && (
            <div className={iconStyles}>
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
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

          {isPasswordType && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={eyeButtonStyles}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        
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