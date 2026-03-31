'use client'

import { useState } from 'react'
import Bouton from '../components/ui/Bouton'
import Input from '../components/ui/Input'
import { useTranslations } from 'next-intl'
import { Mail, Lock, Eye, EyeOff, Shield, User, UserRound } from 'lucide-react'

export default function RegisterClient() {
  const t = useTranslations('Register')
  const btn = useTranslations('Bouton')
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRegisterSubmit = async () => {
    setIsLoading(true)
    console.log('Prénom:', firstName, 'Nom:', lastName, 'Email:', email)
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleGoogleRegister = () => {
    console.log('Inscription avec Google')
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
          
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-white">
              {t('title')}
            </h1>
          </div>

          <div className="space-y-5">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="text"
                placeholder={t('first_name')}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                icon={<User className="w-5 h-5 text-white" />}
                fullWidth
                variant="default"
                placeholderPosition="left"
                sizes="medium"
              />
              <Input
                type="text"
                placeholder={t('last_name')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                icon={<UserRound className="w-5 h-5 text-white" />}
                fullWidth
                variant="default"
                placeholderPosition="left"
                sizes="medium"
              />
            </div>

            {/* Email */}
            <Input
              type="email"
              placeholder={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5 text-white" />}
              fullWidth
              variant="default"
              placeholderPosition="left"
              sizes="medium"
            />

            {/* Mot de passe */}
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Shield className="w-5 h-5 text-white" />}
                fullWidth
                variant="default"
                placeholderPosition="left"
                sizes="medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-white" />
                ) : (
                  <Eye className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            {/* Confirmer mot de passe */}
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('confirm_password')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock className="w-5 h-5 text-white" />}
                fullWidth
                variant="default"
                placeholderPosition="left"
                sizes="medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5 text-white" />
                ) : (
                  <Eye className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            {/* Bouton inscription */}
            <Bouton
              variant="primary"
              size="medium"
              widthMode="full"
              isLoading={isLoading}
              onClick={handleRegisterSubmit}
              className="mt-2"
            >
              {btn('register')}
            </Bouton>
          </div>

          {/* Séparateur */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/30"></div>
              <span className="w-full text-center text-white text-sm">
                {t('or_continue')}
              </span>
              <div className="w-full border-t border-white/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              
            </div>
          </div>

          {/* Google */}
          <div className="flex justify-center">
            <button
              onClick={handleGoogleRegister}
              className="flex items-center justify-center transition-all duration-200 cursor-pointer"
            >
              <svg className="w-12 h-12" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </button>
          </div>

          {/* Lien connexion */}
          <div className="text-center mt-6">
            <p className="text-sm text-white">
              {t('have_account')}{' '}
              <a href="/login" className="text-white font-medium hover:underline">
                {t('login')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}