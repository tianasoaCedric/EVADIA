'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Eye, Search, Clock, Trash2 } from 'lucide-react'
import Link from 'next/link'

// Données mock
const mockActivity = [
  { id: 1, type: 'view', item: 'Ecolodge de la Forêt', date: '2026-05-18', href: '/hotel/ecolodge-1' },
  { id: 2, type: 'view', item: 'Villa de Rêve', date: '2026-05-17', href: '/hotel/villa-1' },
  { id: 3, type: 'search', item: 'Hôtels à Paris', date: '2026-05-16' },
  { id: 4, type: 'view', item: 'Palace Hôtel', date: '2026-05-15', href: '/hotel/palace-1' },
]

export default function ProfileActivity() {
  const t = useTranslations('ProfileActivity')
  const [activity, setActivity] = useState(mockActivity)

  const handleClearHistory = () => {
    setActivity([])
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <Eye className="w-4 h-4 text-blue-500" />
      case 'search':
        return <Search className="w-4 h-4 text-green-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#01BDA5]" />
          <h2 className="text-xl font-semibold text-gray-800">{t('title')}</h2>
        </div>
        {activity.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1 text-red-500 text-sm hover:underline"
          >
            <Trash2 className="w-3 h-3" />
            {t('clear_history')}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {activity.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {getActivityIcon(item.type)}
              <div>
                <p className="text-sm text-gray-800">
                  {item.type === 'view' ? t('viewed') : t('searched')} <span className="font-medium">{item.item}</span>
                </p>
                <p className="text-xs text-gray-400">{item.date}</p>
              </div>
            </div>
            {item.type === 'view' && item.href && (
              <Link href={item.href} className="text-[#01BDA5] text-sm hover:underline">
                {t('see')}
              </Link>
            )}
          </div>
        ))}
      </div>

      {activity.length === 0 && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{t('no_activity')}</p>
        </div>
      )}
    </div>
  )
}