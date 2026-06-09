'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LogOut, User, CalendarDays, DollarSign, ChevronDown, Heart, LogIn, UserPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { authService } from '@/lib/services'
import type { User as UserType } from '@/lib/types'

interface AvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'dark'
  className?: string
  onDeviseChange?: (devise: string) => void
}

const sizeStyles = {
  xs:  { container: 'w-6 h-6',   text: 'text-xs',  online: 'w-1.5 h-1.5', icon: 'w-3 h-3' },
  sm:  { container: 'w-8 h-8',   text: 'text-sm',  online: 'w-2 h-2',     icon: 'w-4 h-4' },
  md:  { container: 'w-10 h-10', text: 'text-base', online: 'w-2.5 h-2.5', icon: 'w-5 h-5' },
  lg:  { container: 'w-12 h-12', text: 'text-lg',  online: 'w-3 h-3',     icon: 'w-6 h-6' },
  xl:  { container: 'w-16 h-16', text: 'text-xl',  online: 'w-3.5 h-3.5', icon: 'w-8 h-8' },
}

const variantStyles = {
  default: { bg: 'bg-white/20 border border-white/20',  text: 'text-white' },
  dark:    { bg: 'bg-gray-100 border border-gray-200',  text: 'text-gray-800' },
}

const Avatar = ({ size = 'md', variant = 'default', className = '', onDeviseChange }: AvatarProps) => {
  const router = useRouter()
  const t = useTranslations('Avatar')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [user, setUser] = useState<UserType | null>(null)
  const [imageError, setImageError] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [deviseOpen, setDeviseOpen] = useState(false)
  const [selectedDevise, setSelectedDevise] = useState('EUR')

  // Charger la devise depuis localStorage
  useEffect(() => {
    const savedDevise = localStorage.getItem('selectedDevise')
    if (savedDevise) {
      setSelectedDevise(savedDevise)
    }
  }, [])

  // Charger l'utilisateur connecté — le cookie httpOnly est envoyé automatiquement
  useEffect(() => {
    authService.me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
  }, [])

  // Fermer le dropdown si clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setDeviseOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleClick = () => {
    setIsOpen((prev) => !prev)
    setDeviseOpen(false)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authService.logout()
    } finally {
      setUser(null)
      setIsOpen(false)
      setIsLoggingOut(false)
      router.push('/')
    }
  }

  const handleDeviseChange = (code: string) => {
    setSelectedDevise(code)
    setDeviseOpen(false)
    localStorage.setItem('selectedDevise', code)
    onDeviseChange?.(code)
  }

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api'
    window.location.href = `${apiUrl}/auth/google`
  }

  const getInitials = (): string => {
    if (!user) return '?'
    const p = user.prenom?.[0] ?? ''
    const n = user.nom?.[0] ?? ''
    return (p + n).toUpperCase() || '?'
  }

  const s = sizeStyles[size]
  const v = variantStyles[variant]

  const renderContent = () => {
    if (user?.avatar_url && !imageError) {
      return (
        <Image
          src={user.avatar_url as string}
          alt={user.prenom}
          fill
          className="object-cover rounded-full"
          onError={() => setImageError(true)}
          sizes="64px"
        />
      )
    }
    if (user) {
      return <span className={`font-semibold ${v.text} ${s.text}`}>{getInitials()}</span>
    }
    return (
      <svg className={`${v.text} ${s.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bouton avatar */}
      <button
        onClick={handleClick}
        aria-label={user ? t('my_profile') : t('login')}
        className={`
          relative flex items-center justify-center rounded-full
          ${v.bg} ${s.container}
          transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95
          ${className}
        `}
      >
        {renderContent()}
      </button>

      {/* Dropdown utilisateur connecté */}
      {isOpen && user && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* En-tête utilisateur */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.prenom} {user.nom}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={() => { setIsOpen(false); router.push('/profil') }}
              className="flex items-center cursor-pointer gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4 text-gray-400" />
              {t('my_profile')}
            </button>
            
            <button
              onClick={() => { setIsOpen(false); router.push('/reservations') }}
              className="flex items-center cursor-pointer gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <CalendarDays className="w-4 h-4 text-gray-400" />
              {t('my_bookings')}
            </button>

            <button
              onClick={() => { setIsOpen(false); router.push('/favorite') }}
              className="flex items-center cursor-pointer gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Heart className="w-4 h-4 text-gray-400" />
              {t('my_favorites')}
            </button>
          </div>

          {/* Déconnexion */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex cursor-pointer items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? t('logging_out') : t('logout')}
            </button>
          </div>
        </div>
      )}

      {/* Dropdown utilisateur non connecté */}
      {isOpen && !user && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Actions de connexion */}
          <div className="py-2">
            <button
              onClick={() => { setIsOpen(false); router.push('/login') }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-gray-400" />
              {t('login')}
            </button>
            
            <button
              onClick={() => { setIsOpen(false); router.push('/register') }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-gray-400" />
              {t('register')}
            </button>
          </div>

          {/* Séparateur */}
          <div className="border-t border-gray-100 my-1"></div>

          {/* Google */}
          <div className="py-2">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t('continue_with_google')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Avatar