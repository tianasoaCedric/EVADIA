import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { apiClient } from '@/lib/api-client'
import type { Destination, Hotel } from '@/lib/types'
import DestinationClient from './DestinationClient'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('DestinationPage')
  return {
    title: t('meta_title'),
    description: t('meta_description'),
    keywords: t('meta_keywords'),
    openGraph: {
      title: t('meta_title'),
      description: t('meta_description'),
      type: 'website',
      locale: 'fr_FR',
      siteName: 'Evadia',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title'),
      description: t('meta_description'),
    },
  }
}

export default async function DestinationPage() {
  const [destRes, selectionRes] = await Promise.all([
    apiClient.get<{ data: Destination[] }>('/destinations', undefined, 300),
    apiClient.get<{ data: Hotel[] }>('/hotels?selection=1', undefined, 300),
  ])

  return (
    <DestinationClient
      destinations={destRes.data}
      selectionHotels={selectionRes.data}
    />
  )
}
