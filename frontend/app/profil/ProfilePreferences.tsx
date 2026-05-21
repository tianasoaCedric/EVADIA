'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Globe, DollarSign, Bell, Mail as MailIcon, Save } from 'lucide-react'
import Bouton from '../components/ui/Bouton'

export default function ProfilePreferences() {
  const t = useTranslations('ProfilePreferences')
  const [isLoading, setIsLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    language: 'FR',
    currency: 'EUR',
    emailNotifications: true,
    newsletter: false,
  })

  useEffect(() => {
    const savedLang = localStorage.getItem('selectedLang')
    const savedDevise = localStorage.getItem('selectedDevise')
    if (savedLang) setPreferences(prev => ({ ...prev, language: savedLang }))
    if (savedDevise) setPreferences(prev => ({ ...prev, currency: savedDevise }))
  }, [])

  const handleSubmit = async () => {
    setIsLoading(true)
    localStorage.setItem('selectedLang', preferences.language)
    localStorage.setItem('selectedDevise', preferences.currency)
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsLoading(false)
    alert(t('success'))
  }

  const languages = [
    { code: 'FR', name: 'Français' },
    { code: 'EN', name: 'English' },
  ]

  const currencies = [
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'USD', name: 'Dollar US', symbol: '$' },
    { code: 'GBP', name: 'Livre sterling', symbol: '£' },
    { code: 'MGA', name: 'Ariary', symbol: 'Ar' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="w-5 h-5 text-[#01BDA5]" />
        <h2 className="text-xl font-semibold text-gray-800">{t('title')}</h2>
      </div>

      <div className="space-y-6">
        {/* Langue */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            {t('language')}
          </label>
          <select
            value={preferences.language}
            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#01BDA5]"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>

        {/* Devise */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-2" />
            {t('currency')}
          </label>
          <select
            value={preferences.currency}
            onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#01BDA5]"
          >
            {currencies.map(curr => (
              <option key={curr.code} value={curr.code}>{curr.name} ({curr.symbol})</option>
            ))}
          </select>
        </div>

        {/* Notifications */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="font-medium text-gray-800 mb-3">{t('notifications')}</h3>
          
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{t('email_notifications')}</span>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-[#01BDA5] transition-colors"></div>
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </div>
          </label>

          <label className="flex items-center justify-between py-2 cursor-pointer">
            <div className="flex items-center gap-2">
              <MailIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{t('newsletter')}</span>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={preferences.newsletter}
                onChange={(e) => setPreferences({ ...preferences, newsletter: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-[#01BDA5] transition-colors"></div>
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </div>
          </label>
        </div>

        <Bouton
          variant="primary"
          size="medium"
          widthMode="full"
          onClick={handleSubmit}
          isLoading={isLoading}
          className="flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {t('save')}
        </Bouton>
      </div>
    </div>
  )
}