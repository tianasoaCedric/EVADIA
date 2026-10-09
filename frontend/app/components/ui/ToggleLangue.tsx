'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl';
import { changeLanguage } from '@/app/actions/language'; // Ajustez le chemin selon votre structure
import { usePathname } from 'next/navigation';

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
  const locale = useLocale(); // Récupérer la locale actuelle depuis next-intl
  const pathname = usePathname(); // Récupérer le chemin actuel
  const [lang, setLang] = useState<'FR' | 'EN'>(currentLang);
  const [isLoading, setIsLoading] = useState(false);

  // Synchroniser avec la locale de next-intl
  useEffect(() => {
    const newLang = locale.toUpperCase() as 'FR' | 'EN';
    setLang(newLang);
  }, [locale]);

  const handleToggle = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    const newLang = lang === 'FR' ? 'EN' : 'FR';
    const newLocale = newLang.toLowerCase();
    
    try {
      // Appeler l'action serveur pour changer la langue
      await changeLanguage(newLocale, pathname);
      
      // Mettre à jour l'état local
      setLang(newLang);
      onToggle?.(newLang);
    } catch (error) {
      console.error('Erreur lors du changement de langue:', error);
    } finally {
      setIsLoading(false);
    }
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
        disabled={disabled || isLoading}
        onClick={handleToggle}
        className={`
          relative inline-flex items-center
          rounded-full
          border-0 outline-3
          ${variant === 'dark' ? 'outline-gray-800' : 'outline-[#F5F5F5]'}
          bg-transparent
          transition-colors duration-200
          ${toggleSizeStyles[size].track}
          ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
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
        ${isLoading ? 'opacity-50' : ''}
      `}>
        {isEN ? 'EN' : 'FR'}
      </span>
    </div>
  )
}

export default ToggleLangue