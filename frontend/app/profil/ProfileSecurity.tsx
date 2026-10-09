'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Lock, Eye, EyeOff, Shield } from 'lucide-react'
import Input from '../components/ui/Input'
import Bouton from '../components/ui/Bouton'
import { profileService } from '@/lib/services/profile.service'

export default function ProfileSecurity() {
  const t = useTranslations('ProfileSecurity')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSubmit = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: t('password_mismatch') })
      return
    }
    setIsLoading(true)
    setMessage(null)
    try {
      await profileService.updatePassword({
        current_password: formData.currentPassword,
        password: formData.newPassword,
        password_confirmation: formData.confirmPassword,
      })
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setMessage({ type: 'success', text: t('success') })
    } catch {
      setMessage({ type: 'error', text: t('error') })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-[#01BDA5]" />
        <h2 className="text-xl font-semibold text-gray-800">{t('title')}</h2>
      </div>

      {message && (
        <p className={`text-sm mb-4 ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
          {message.text}
        </p>
      )}

      <div className="space-y-4">
        <div className="relative">
          <Input
            variant="light"
            type={showCurrentPassword ? 'text' : 'password'}
            placeholder={t('current_password')}
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            icon={<Lock className="w-5 h-5 text-gray-800" />}
            fullWidth
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showCurrentPassword ? (
              <EyeOff className="w-5 h-5 text-gray-800" />
            ) : (
              <Eye className="w-5 h-5 text-gray-800" />
            )}
          </button>
        </div>

        <div className="relative">
          <Input
          variant="light"
            type={showNewPassword ? 'text' : 'password'}
            placeholder={t('new_password')}
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            icon={<Lock className="w-5 h-5 text-gray-800" />}
            fullWidth
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showNewPassword ? (
              <EyeOff className="w-5 h-5 text-gray-800" />
            ) : (
              <Eye className="w-5 h-5 text-gray-800" />
            )}
          </button>
        </div>

        <div className="relative">
          <Input
          variant="light"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder={t('confirm_password')}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            icon={<Lock className="w-5 h-5 text-gray-800" />}
            fullWidth
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5 text-gray-800" />
            ) : (
              <Eye className="w-5 h-5 text-gray-800" />
            )}
          </button>
        </div>

        <Bouton
          variant="primary"
          size="medium"
          widthMode="full"
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
        >
          {t('change_password')}
        </Bouton>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-xl">
        <p className="text-sm text-yellow-700">
          🔒 {t('password_tip')}
        </p>
      </div>
    </div>
  )
}