'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { User, Mail, Phone, Calendar, MapPin, Camera, Save } from 'lucide-react'
import type { User as UserType } from '@/lib/types'
import Input from '@/app/components/ui/Input'
import Bouton from '@/app/components/ui/Bouton'
import Image from 'next/image'

interface ProfileInfoProps {
  user: UserType
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  const t = useTranslations('ProfileInfo')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user.prenom || '',
    lastName: user.nom || '',
    email: user.email || '',
    phone: user.telephone || '',
    birthDate: user.date_naissance || '',
    country: user.pays || '',
    city: user.ville || '',
  })

  const handleSubmit = async () => {
    setIsLoading(true)
    // Appel API pour mettre à jour le profil
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    setIsEditing(false)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('Upload avatar:', file)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{t('title')}</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[#01BDA5] text-sm font-medium hover:underline"
          >
            {t('edit')}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-500 text-sm hover:underline"
            >
              {t('cancel')}
            </button>
            <Bouton
              size="small"
              onClick={handleSubmit}
              isLoading={isLoading}
              className="flex items-center gap-1"
            >
              <Save className="w-3 h-3" />
              {t('save')}
            </Bouton>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden relative">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.prenom || 'Avatar'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#01BDA5]/20 text-[#01BDA5] text-2xl font-bold">
                {user.prenom?.[0]}{user.nom?.[0]}
              </div>
            )}
          </div>
          {isEditing && (
            <label className="absolute bottom-0 right-0 p-1.5 bg-[#01BDA5] rounded-full cursor-pointer hover:bg-[#01A38E] transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            variant="light"
            type="text"
            placeholder={t('first_name')}
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            icon={<User className="w-5 h-5 text-gray-800" />}
            fullWidth
            disabled={!isEditing}
          />
          <Input
          variant="light"
            type="text"
            placeholder={t('last_name')}
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            icon={<User className="w-5 h-5 text-gray-800" />}
            fullWidth
            disabled={!isEditing}
          />
        </div>

        <Input
        variant="light"
          type="email"
          placeholder={t('email')}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          icon={<Mail className="w-5 h-5 text-gray-800" />}
          fullWidth
          disabled={!isEditing}
        />

        <Input
        variant="light"
          type="tel"
          placeholder={t('phone')}
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          icon={<Phone className="w-5 h-5 text-gray-800" />}
          fullWidth
          disabled={!isEditing}
        />

        <Input
        variant="light"
          type="date"
          placeholder={t('birth_date')}
          value={formData.birthDate}
          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          icon={<Calendar className="w-5 h-5 text-gray-800" />}
          fullWidth
          disabled={!isEditing}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
          variant="light"
            type="text"
            placeholder={t('country')}
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            icon={<MapPin className="w-5 h-5 text-gray-800" />}
            fullWidth
            disabled={!isEditing}
          />
          <Input
          variant="light"
            type="text"
            placeholder={t('city')}
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            icon={<MapPin className="w-5 h-5 text-gray-800" />}
            fullWidth
            disabled={!isEditing}
          />
        </div>
      </div>
    </div>
  )
}