import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import VilleClient from './VilleClient'
import { decodeIdFromSlug, getNameFromSlug } from '@/lib/slug'

interface PageProps {
  params: Promise<{
    slug: string
  }>
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
  
  return <VilleClient villeId={villeId} villeName={villeName} slug={slug} />
}