import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import HomePage from './HomeClient'
import { hotelService } from '@/lib/services'
import { offreService } from '@/lib/services/offre.service'
import { decouverteService } from '@/lib/services/decouverte.service'
import type { VillePopulaire } from '@/lib/services/hotel.service'
import type { Offre } from '@/lib/services/offre.service'
import type { VilleDecouverte } from '@/lib/types'

export const revalidate = 3600

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
  const [popularVillesRes, offresRes, villesRes] = await Promise.allSettled([
    hotelService.popularVilles(),
    offreService.list({ page: 1 }),
    decouverteService.getVilles(),
  ])

  const popularVilles: VillePopulaire[] = popularVillesRes.status === 'fulfilled' ? popularVillesRes.value.data : []
  const offres: Offre[] = offresRes.status === 'fulfilled' ? offresRes.value.data.slice(0, 3) : []
  const villes: VilleDecouverte[] = villesRes.status === 'fulfilled' ? villesRes.value : []

  return (
    <HomePage
      popularVilles={popularVilles}
      offres={offres}
      villes={villes}
    />
  )
}
