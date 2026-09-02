import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import CityClient from './CityClient'
import { decodeIdFromSlug, getNameFromSlug } from '@/lib/slug'
import { apiClient } from '@/lib/api-client'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

interface Ville {
  id: number
  nom: string
  destination_id: number
  description?: string | null
  image?: string | null
}

interface ApiHotel {
  id: number
  nom: string
  etoiles: number
  photo_principale: string | null
  ville: string | null
  prix_min: number | null
  prix_min_mga?: number | null
  prix_min_eur?: number | null
  note_moyenne: number | null
  nb_avis: number
}

interface DestinationData {
  destination: { id: number; nom: string; description: string; image_url: string; couverture?: string[] }
  villes: Ville[]
}

interface HotelsPage {
  data: ApiHotel[]
  current_page: number
  last_page: number
  total: number
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations('CityPage')
  const { slug } = await params
  const cityName = getNameFromSlug(slug)
  return {
    title: t('meta_title', { name: cityName }),
    description: t('meta_description', { name: cityName }),
  }
}

export default async function CityPage({ params }: PageProps) {
  const { slug } = await params
  const cityId = decodeIdFromSlug(slug)
  const cityName = getNameFromSlug(slug)

  const [villesRes, hotelsRes, popularRes] = await Promise.all([
    apiClient.get<{ data: DestinationData }>(`/destinations/${cityId}/villes`, 300),
    apiClient.get<HotelsPage>(`/destinations/${cityId}/hotels?selection=1`, 300),
    apiClient.get<{ data: ApiHotel[] }>(`/destinations/${cityId}/hotels?popular=1`, 300),
  ])

  return (
    <CityClient
      cityId={cityId}
      cityName={cityName}
      slug={slug}
      initialData={villesRes.data}
      initialHotels={hotelsRes.data}
      initialPopularHotels={popularRes.data}
    />
  )
}
