'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronLeft, User, Shield, Heart, Calendar, Settings, CreditCard, Activity } from 'lucide-react'
import Image from 'next/image'
import { authService } from '@/lib/services'
import type { User as UserType } from '@/lib/types'

const ProfileInfo = lazy(() => import('./ProfileInfo'))
const ProfileSecurity = lazy(() => import('./ProfileSecurity'))
const ProfilePreferences = lazy(() => import('./ProfilePreferences'))
const ProfileBookings = lazy(() => import('./ProfileBookings'))
const ProfileFavorites = lazy(() => import('./ProfileFavorites'))
const ProfilePaymentMethods = lazy(() => import('./ProfilePaymentMethods'))
const ProfileActivity = lazy(() => import('./ProfileActivity'))

const TAB_IDS = ['info', 'security', 'favorites', 'bookings', 'preferences', 'payments', 'activity'] as const
type TabId = typeof TAB_IDS[number]

function TabSkeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="space-y-3">
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="h-10 bg-gray-100 rounded-xl" />
            </div>
        </div>
    )
}

function ActiveTabContent({ activeTab, user }: { activeTab: TabId; user: UserType }) {
    switch (activeTab) {
        case 'info': return <ProfileInfo user={user} />
        case 'security': return <ProfileSecurity />
        case 'favorites': return <ProfileFavorites />
        case 'bookings': return <ProfileBookings />
        case 'preferences': return <ProfilePreferences />
        case 'payments': return <ProfilePaymentMethods />
        case 'activity': return <ProfileActivity />
    }
}

export default function ProfileClient() {
    const router = useRouter()
    const t = useTranslations('Profile')
    const [user, setUser] = useState<UserType | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<TabId>('info')

    useEffect(() => {
        authService.me()
            .then((response) => setUser(response.user))
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }, [])

    const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
        { id: 'info', label: t('tabs.info'), icon: <User className="w-4 h-4" /> },
        { id: 'security', label: t('tabs.security'), icon: <Shield className="w-4 h-4" /> },
        { id: 'favorites', label: t('tabs.favorites'), icon: <Heart className="w-4 h-4" /> },
        { id: 'bookings', label: t('tabs.bookings'), icon: <Calendar className="w-4 h-4" /> },
        { id: 'preferences', label: t('tabs.preferences'), icon: <Settings className="w-4 h-4" /> },
        { id: 'payments', label: t('tabs.payments'), icon: <CreditCard className="w-4 h-4" /> },
        { id: 'activity', label: t('tabs.activity'), icon: <Activity className="w-4 h-4" /> },
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

    const getInitials = () => {
        const p = user.prenom?.[0] ?? ''
        const n = user.nom?.[0] ?? ''
        return (p + n).toUpperCase() || '?'
    }

    return (
        <main className="min-h-screen pt-24 pb-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="rounded-2xl pt-6 mb-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 text-gray-600 hover:text-[#01BDA5] transition-colors cursor-pointer"
                            >
                                <ChevronLeft className="w-8 h-8" />
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
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                                    {user.prenom} {user.nom}
                                </h1>
                                <p className="text-gray-500 text-sm">{user.email}</p>
                            </div>
                        </div>
                    </div>

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

                    <div className="w-full">
                        <Suspense fallback={<TabSkeleton />}>
                            <ActiveTabContent activeTab={activeTab} user={user} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </main>
    )
}
