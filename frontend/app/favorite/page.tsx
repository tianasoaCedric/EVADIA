import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import FavoriteClient from './FavoriteClient'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('FavoritePage')
  
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

export default function FavoritePage() {
  return <FavoriteClient />
}