import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import OfferClient from './OfferClient'
import { offreService } from '@/lib/services'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('OfferPage')
  
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

export default async function OfferPage() {
  const initialData = await offreService.list({ page: 1 }).catch(() => undefined)
  return <OfferClient initialData={initialData} />
}