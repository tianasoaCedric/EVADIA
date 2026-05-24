import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import HomePage from './HomeClient'
import { hotelService } from '@/lib/services'
import { offreService } from '@/lib/services/offre.service'
import { decouverteService } from '@/lib/services/decouverte.service'
import type { Hotel } from '@/lib/types'
import type { Offre } from '@/lib/services/offre.service'
import type { VilleDecouverte } from '@/lib/types'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('HomePage')
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
    }
  }
}

export default async function RegisterPage() {
  const [popularRes, offresRes, villesRes] = await Promise.allSettled([
    hotelService.popular(),
    offreService.list({ page: 1 }),
    decouverteService.getVilles(),
  ])

  const popularHotels: Hotel[] = popularRes.status === 'fulfilled' ? popularRes.value.data : []
  const offres: Offre[] = offresRes.status === 'fulfilled' ? offresRes.value.data.slice(0, 3) : []
  const villes: VilleDecouverte[] = villesRes.status === 'fulfilled' ? villesRes.value.slice(0, 3) : []

  return (
    <HomePage
      popularHotels={popularHotels}
      offres={offres}
      villes={villes}
    />
  )
}
