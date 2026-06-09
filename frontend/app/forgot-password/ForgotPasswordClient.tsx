'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Mail, ChevronLeft } from 'lucide-react'
import Bouton from '../components/ui/Bouton'
import Input from '../components/ui/Input'
import { authService } from '@/lib/services'
import { ApiError } from '@/lib/api-client'

export default function ForgotPasswordClient() {
  const router = useRouter()
  const t = useTranslations('ForgotPassword')
  const btn = useTranslations('Bouton')
  
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    setFieldError(null)
    
    if (!email.trim()) {
      setFieldError(t('error_required'))
      return
    }

    setIsLoading(true)
    try {
      await authService.forgotPassword({ email: email.trim() })
      setIsSuccess(true)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError(t('error_email_not_found'))
        } else if (err.status === 429) {
          setError(t('error_too_many'))
        } else {
          setError(t('error_generic'))
        }
      } else {
        setError(t('error_generic'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
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
        <div className="flex items-center justify-center min-h-screen px-4 py-12">
          <div className="w-full max-w-md rounded-2xl p-6 md:p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#01BDA5]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-[#01BDA5]" />
              </div>
              <h1 className="text-2xl font-semibold text-white mb-2">
                {t('email_sent_title')}
              </h1>
              <p className="text-white/80 text-sm mb-6">
                {t('email_sent_description', { email })}
              </p>
              <button
                onClick={() => router.push('/login')}
                className="text-[#01BDA5] hover:underline text-sm"
              >
                {t('back_to_login')}
              </button>
            </div>
          </div>
        </div>
      </main>
    )
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
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md rounded-2xl p-6 md:p-8">
          {/* Titre */}
          <div className="text-center mb-8">
          <div className="flex items-center gap-2">
          {/* Bouton retour */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
            <h1 className="text-3xl md:text-4xl font-semibold text-white">
              {t('title')}
            </h1>
          </div>
            <p className="text-white/80 mt-2 text-sm">
              {t('subtitle')}
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-400/50 px-4 py-3 text-sm text-white text-center">
              {error}
            </div>
          )}

          {/* Formulaire */}
          <div className="space-y-5">
            <div>
              <Input
                type="email"
                placeholder={t('email')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setFieldError(null)
                  setError(null)
                }}
                icon={<Mail className="w-5 h-5 text-white" />}
                fullWidth
                variant="default"
                placeholderPosition="left"
                sizes="medium"
              />
              {fieldError && (
                <p className="mt-1 text-xs text-red-300">{fieldError}</p>
              )}
            </div>

            <Bouton
              variant="primary"
              size="medium"
              widthMode="full"
              isLoading={isLoading}
              onClick={handleSubmit}
            >
              {t('send_button')}
            </Bouton>
          </div>

          {/* Lien retour connexion */}
          <div className="text-center mt-6">
            <p className="text-sm text-white/70">
              <a href="/login" className="text-white hover:underline">
                {t('back_to_login')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}