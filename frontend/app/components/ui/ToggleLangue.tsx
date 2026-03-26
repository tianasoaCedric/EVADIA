'use client'

import { useState, useEffect } from 'react'

interface ToggleLangueProps {
  /** Langue actuelle */
  currentLang?: 'FR' | 'EN'
  /** Callback lors du changement de langue */
  onToggle?: (lang: 'FR' | 'EN') => void
  /** Taille du toggle */
  size?: 'sm' | 'md' | 'lg'
  /** Désactiver le toggle */
  disabled?: boolean
  /** Classes supplémentaires */
  className?: string
  variant?: 'default' | 'dark'
}

/**
 * Composant Toggle avec Langue à droite
 * - Toggle outline (fond transparent, bordure, cercle coulissant)
 * - Indication FR/EN à droite du toggle
 */
const ToggleLangue = ({
  currentLang = 'FR',
  onToggle,
  size = 'md',
  disabled = false,
  className = '',
  variant = 'default'
}: ToggleLangueProps) => {
  const [lang, setLang] = useState<'FR' | 'EN'>(currentLang)

  useEffect(() => {
    setLang(currentLang)
  }, [currentLang])

  const handleToggle = () => {
    if (disabled) return
    const newLang = lang === 'FR' ? 'EN' : 'FR'
    setLang(newLang)
    onToggle?.(newLang)
  }

  /**
   * Tailles du toggle
   */
  const toggleSizeStyles = {
    sm: {
      track: 'w-10 h-5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-5',
      container: 'gap-2',
      text: 'text-xs'
    },
    md: {
      track: 'w-12 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-6',
      container: 'gap-3',
      text: 'text-sm'
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
      container: 'gap-4',
      text: 'text-base'
    }
  }

  const isEN = lang === 'EN'

  return (
    <div className={`
      inline-flex items-center
      ${toggleSizeStyles[size].container}
      ${className}
    `}>
      {/* Toggle outline */}
      <button
        type="button"
        role="switch"
        aria-checked={isEN}
        disabled={disabled}
        onClick={handleToggle}
        className={`
          relative inline-flex items-center
          rounded-full
          border-0 outline-3
          ${variant === 'dark' ? 'outline-gray-800' : 'outline-[#F5F5F5]'}
          bg-transparent
          transition-colors duration-200
          ${toggleSizeStyles[size].track}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            absolute left-0.5
            rounded-full
            border-3
            ${variant === 'dark' ? 'border-gray-800' : 'border-[#F5F5F5]'}
            transition-transform duration-200 ease-out
            ${toggleSizeStyles[size].thumb}
            ${isEN ? toggleSizeStyles[size].translate : 'translate-x-0'}
          `}
        />
      </button>

      {/* Indication de langue à droite */}
      <span className={`
        font-medium
        ${toggleSizeStyles[size].text}
        ${variant === 'dark' ? 'text-gray-800' : 'text-[#F5F5F5]'}
        transition-colors duration-200
      `}>
        {isEN ? 'EN' : 'FR'}
      </span>
    </div>
  )
}

export default ToggleLangue