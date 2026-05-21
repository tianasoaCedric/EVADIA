'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronLeft, User, Shield, Heart, Calendar, Settings, CreditCard, Activity } from 'lucide-react'
import Image from 'next/image'
import { authService } from '@/lib/services'
import type { User as UserType } from '@/lib/types'
import ProfileInfo from './ProfileInfo'
import ProfileSecurity from './ProfileSecurity'
import ProfilePreferences from './ProfilePreferences'
import ProfileBookings from './ProfileBookings'
import ProfileFavorites from './ProfileFavorites'
import ProfilePaymentMethods from './ProfilePaymentMethods'
import ProfileActivity from './ProfileActivity'

interface TabProps {
    id: string
    label: string
    icon: React.ReactNode
    component: React.ReactNode
}

export default function ProfileClient() {
    const router = useRouter()
    const t = useTranslations('Profile')
    const [user, setUser] = useState<UserType | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('info')

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await authService.me()
                setUser(response.user)
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchUser()
    }, [])

    const tabs: TabProps[] = [
        { id: 'info', label: t('tabs.info'), icon: <User className="w-4 h-4" />, component: <ProfileInfo user={user} /> },
        { id: 'security', label: t('tabs.security'), icon: <Shield className="w-4 h-4" />, component: <ProfileSecurity /> },
        { id: 'favorites', label: t('tabs.favorites'), icon: <Heart className="w-4 h-4" />, component: <ProfileFavorites /> },
        { id: 'bookings', label: t('tabs.bookings'), icon: <Calendar className="w-4 h-4" />, component: <ProfileBookings /> },
        { id: 'preferences', label: t('tabs.preferences'), icon: <Settings className="w-4 h-4" />, component: <ProfilePreferences /> },
        { id: 'payments', label: t('tabs.payments'), icon: <CreditCard className="w-4 h-4" />, component: <ProfilePaymentMethods /> },
        { id: 'activity', label: t('tabs.activity'), icon: <Activity className="w-4 h-4" />, component: <ProfileActivity /> },
    ]

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-500">{t('loading')}</div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">{t('not_authenticated')}</div>
            </div>
        )
    }

    const activeComponent = tabs.find(tab => tab.id === activeTab)?.component
    const getInitials = () => {
        const p = user.prenom?.[0] ?? ''
        const n = user.nom?.[0] ?? ''
        return (p + n).toUpperCase() || '?'
    }

    return (
        <main className="min-h-screen pt-24 pb-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    {/* En-tête avec avatar et infos utilisateur */}
                    <div className="rounded-2xl pt-6 mb-8">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 text-gray-600 hover:text-[#01BDA5] transition-colors cursor-pointer"
                            >
                                <ChevronLeft className="w-8 h-8" />
                                {/* <span>{t('back')}</span> */}
                            </button>
                            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                {user.avatar_url ? (
                                    <Image
                                        src={user.avatar_url}
                                        alt={user.prenom || 'Avatar'}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#01BDA5]/20 text-[#01BDA5] text-xl font-bold">
                                        {getInitials()}
                                    </div>
                                )}
                            </div>

                            {/* Infos utilisateur */}
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                                    {user.prenom} {user.nom}
                                </h1>
                                <p className="text-gray-500 text-sm">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Onglets */}
                    <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
                  ${activeTab === tab.id
                                        ? 'bg-[#01BDA5] text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }
                `}
                            >
                                {tab.icon}
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Contenu actif */}
                    <div className="w-full">
                        {activeComponent}
                    </div>
                </div>
            </div>
        </main>
    )
}