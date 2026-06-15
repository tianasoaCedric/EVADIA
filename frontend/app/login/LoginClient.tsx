'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Bouton from '../components/ui/Bouton'
import Input from '../components/ui/Input'
import { useTranslations } from 'next-intl'
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import { authService } from '@/lib/services'
import { ApiError } from '@/lib/api-client'

type FieldErrors = {
  email?: string
  password?: string
}


export default function LoginClient() {
  const t = useTranslations('Login')
  const btn = useTranslations('Bouton')
  const router = useRouter()
  const searchParams = useSearchParams()


  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [globalError, setGlobalError] = useState<string | null>(null)

  const validate = (): boolean => {
    const errors: FieldErrors = {}
    if (!email.trim()) errors.email = t('error_required')
    if (!password) errors.password = t('error_required')
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLoginSubmit = async () => {
    setGlobalError(null)
    if (!validate()) return

    setIsLoading(true)
    try {
      const { user } = await authService.login({ email: email.trim(), password })

      const isClient = user.roles.some((r) => r.code === 'client')
      if (!isClient) {
        await authService.logout()
        setGlobalError(t('error_not_client'))
        return
      }

      const redirect = searchParams.get('redirect')
      router.push(redirect ? decodeURIComponent(redirect) : '/')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422) {
          // Le backend retourne l'erreur sur le champ email (identifiants incorrects ou compte désactivé)
          const emailError = err.errors?.email?.[0]
          if (emailError) {
            setFieldErrors({ email: emailError })
          } else {
            setGlobalError(t('error_invalid_credentials'))
          }
        } else if (err.status === 429) {
          setGlobalError(t('error_too_many'))
        } else {
          setGlobalError(t('error_generic'))
        }
      } else {
        setGlobalError(t('error_generic'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = '/auth/google'
  }

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundImage: 'url("/photos/bc.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className='flex items-center justify-center min-h-screen px-4 py-12'>
        <div className="w-full max-w-md rounded-2xl p-6 md:p-8">

          {/* Titre */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-white">
              {t('title')}
            </h1>
            <p className="text-white/80 mt-2">
              {t('subtitle')}
            </p>
          </div>

          {/* Erreur globale */}
          {globalError && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-400/50 px-4 py-3 text-sm text-white text-center">
              {globalError}
            </div>
          )}

          {/* Formulaire */}
          <div className="space-y-5">
            {/* Email */}
            <div>
              <Input
                type="email"
                placeholder={t('email')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setFieldErrors((prev) => ({ ...prev, email: undefined }))
                }}
                icon={<Mail className="w-5 h-5 text-white" />}
                fullWidth
                variant="default"
                placeholderPosition="left"
                sizes='medium'
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-300">{fieldErrors.email}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <div className="relative">
                <Input
                  type="password"
                  placeholder={t('password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Shield className="w-5 h-5 text-white" />}
                  fullWidth
                  variant="default"
                  placeholderPosition="left"
                  sizes='medium'
                  showPasswordToggle={true}  // Optionnel, true par défaut
                />
                {/* <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-white hover:text-white" />
                  ) : (
                    <Eye className="w-5 h-5 text-white hover:text-white" />
                  )}
                </button> */}
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-300">{fieldErrors.password}</p>
              )}
              <div className="text-left mt-1">
                <a href="/forgot-password" className="text-xs text-white hover:underline">
                  {t('forgot_password')}
                </a>
              </div>

              {/* Bouton connexion */}
              <Bouton
                variant="primary"
                size="medium"
                widthMode="full"
                isLoading={isLoading}
                onClick={handleLoginSubmit}
                className="mt-1"
              >
                {btn('login')}
              </Bouton>
            </div>
          </div>

          {/* Séparateur */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
              <span className="w-full text-center text-white text-sm">
                {t('or_continue')}
              </span>
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">

            </div>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 transition-all duration-200"
          >
            <svg className="w-12 h-12 cursor-pointer" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </button>

          {/* Inscription */}
          <div className="text-center mt-6">
            <p className="text-sm text-white">
              {t('no_account')}{' '}
              <a href="/register" className="text-white font-medium hover:underline">
                {t('signup')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
