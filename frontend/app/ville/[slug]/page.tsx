import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import VilleClient from './VilleClient'
import { decodeIdFromSlug, getNameFromSlug } from '@/lib/slug'
import { apiClient } from '@/lib/api-client'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

interface ApiHotel {
  id: number
  nom: string
  etoiles: number | null
  photo_principale: string | null
  ville: string | null
  prix_min: number | null
  prix_min_mga?: number | null
  prix_min_eur?: number | null
  note_moyenne: number | null
  nb_avis: number
}

interface PaginatedHotels {
  data: ApiHotel[]
  current_page: number
  last_page: number
  total: number
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations('VillePage')
  const { slug } = await params
  const villeName = getNameFromSlug(slug)
  return {
    title: t('meta_title', { name: villeName }),
    description: t('meta_description', { name: villeName }),
    keywords: t('meta_keywords', { name: villeName }),
    openGraph: {
      title: t('meta_title', { name: villeName }),
      description: t('meta_description', { name: villeName }),
      type: 'website',
      locale: 'fr_FR',
      siteName: 'Evadia',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title', { name: villeName }),
      description: t('meta_description', { name: villeName }),
    },
  }
}

export default async function VillePage({ params }: PageProps) {
  const { slug } = await params
  const villeId = decodeIdFromSlug(slug)
  const villeName = getNameFromSlug(slug)

  const [hotelsRes, selectionRes] = await Promise.all([
    apiClient.get<PaginatedHotels>(`/villes/${villeId}/hotels`, 120),
    apiClient.get<{ data: ApiHotel[] }>(`/villes/${villeId}/hotels?selection=1`, 300),
  ])

  return (
    <VilleClient
      villeName={villeName}
      slug={slug}
      initialHotels={hotelsRes.data}
      initialSelectionHotels={selectionRes.data}
    />
  )
}
