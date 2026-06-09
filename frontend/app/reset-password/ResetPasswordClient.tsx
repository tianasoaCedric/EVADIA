'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Lock, Eye, EyeOff, ChevronLeft, CheckCircle } from 'lucide-react'
import Bouton from '../components/ui/Bouton'
import Input from '../components/ui/Input'
import { authService } from '@/lib/services'
import { ApiError } from '@/lib/api-client'

export default function ResetPasswordClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('ResetPassword')
  
  const [step, setStep] = useState<'code' | 'password'>('code')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const email = searchParams.get('email') || ''

  useEffect(() => {
    if (step === 'code' && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [step])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setCodeError(null)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').slice(0, 6)
    const digits = pasted.split('').filter(c => /[0-9]/.test(c))
    const newCode = [...code]
    for (let i = 0; i < Math.min(digits.length, 6); i++) {
      newCode[i] = digits[i]
    }
    setCode(newCode)
    const lastIndex = Math.min(digits.length, 5)
    if (lastIndex < 6) inputRefs.current[lastIndex]?.focus()
  }

  const handleVerifyCode = async () => {
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      setCodeError(t('error_code_incomplete'))
      return
    }

    setIsLoading(true)
    setCodeError(null)
    setGlobalError(null)
    
    try {
      await authService.verifyResetCode({ email, code: fullCode })
      setStep('password')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422) setCodeError(t('error_invalid_code'))
        else if (err.status === 404) setCodeError(t('error_code_expired'))
        else setGlobalError(t('error_generic'))
      } else {
        setGlobalError(t('error_generic'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!password) {
      setPasswordError(t('error_password_required'))
      return
    }
    if (password.length < 6) {
      setPasswordError(t('error_password_min'))
      return
    }
    if (password !== confirmPassword) {
      setPasswordError(t('error_password_mismatch'))
      return
    }

    setIsLoading(true)
    setPasswordError(null)
    setGlobalError(null)
    
    try {
      await authService.resetPassword({ email, code: code.join(''), password, password_confirmation: confirmPassword })
      setIsSuccess(true)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422) setGlobalError(t('error_invalid'))
        else if (err.status === 404) setGlobalError(t('error_code_expired'))
        else setGlobalError(t('error_generic'))
      } else {
        setGlobalError(t('error_generic'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    try {
      await authService.forgotPassword({ email })
      setGlobalError(null)
    } catch {
      setGlobalError(t('error_resend'))
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen" style={{ backgroundImage: 'url("/photos/bc.png")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <div className="flex items-center justify-center min-h-screen px-4 py-12">
          <div className="w-full max-w-md rounded-2xl p-6 md:p-8 text-center">
            <div className="w-16 h-16 bg-[#01BDA5]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#01BDA5]" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-2">{t('success_title')}</h1>
            <p className="text-white/80 text-sm mb-6">{t('success_description')}</p>
            <button onClick={() => router.push('/login')} className="px-6 py-2 rounded-full bg-[#01BDA5] text-white hover:bg-[#01A38E]">
              {t('go_to_login')}
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundImage: 'url("/photos/bc.png")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md rounded-2xl p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="flex items-center gap-2">
              <button onClick={() => step === 'code' ? router.back() : setStep('code')} className="flex cursor-pointer items-center gap-2 text-white hover:text-white">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-3xl md:text-4xl font-semibold text-white">{step === 'code' ? t('code_title') : t('password_title')}</h1>
            </div>
            <p className="text-white/80 mt-2 text-sm">{step === 'code' ? t('code_subtitle') : t('password_subtitle')}</p>
            {email && <p className="text-white/60 text-xs mt-1">{t('for_email', { email })}</p>}
          </div>

          {globalError && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-400/50 px-4 py-3 text-sm text-white text-center">
              {globalError}
            </div>
          )}

          {step === 'code' && (
            <div className="space-y-6">
              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    onPaste={index === 0 ? handleCodePaste : undefined}
                    className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-semibold bg-white/10 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#01BDA5] transition-all ${codeError ? 'border-red-400' : 'border-white/20'}`}
                  />
                ))}
              </div>
              {codeError && <p className="text-center text-xs text-red-300">{codeError}</p>}
              <Bouton variant="primary" size="medium" widthMode="full" isLoading={isLoading} onClick={handleVerifyCode}>
                {t('verify_button')}
              </Bouton>
              <div className="text-center">
                <button onClick={handleResendCode} className="text-sm text-white/70 hover:text-white">{t('resend_code')}</button>
              </div>
            </div>
          )}

          {step === 'password' && (
            <div className="space-y-5">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('new_password')}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(null) }}
                  icon={<Lock className="w-5 h-5 text-white" />}
                  fullWidth variant="default" placeholderPosition="left" sizes="medium" showPasswordToggle={true}
                />
              </div>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t('confirm_password')}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(null) }}
                  icon={<Lock className="w-5 h-5 text-white" />}
                  fullWidth variant="default" placeholderPosition="left" sizes="medium" showPasswordToggle={true}
                />
              </div>
              {passwordError && <p className="text-xs text-red-300">{passwordError}</p>}
              <Bouton variant="primary" size="medium" widthMode="full" isLoading={isLoading} onClick={handleResetPassword}>
                {t('reset_button')}
              </Bouton>
            </div>
          )}

          <div className="text-center mt-6">
            <a href="/login" className="text-sm text-white/70 hover:text-white">{t('back_to_login')}</a>
          </div>
        </div>
      </div>
    </main>
  )
}