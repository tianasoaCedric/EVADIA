import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ProprieteClient from './ProprieteClient'
import { decodeIdFromSlug, getNameFromSlug } from '@/lib/slug'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations('ProprietePage')
  const { slug } = await params
  const proprieteName = getNameFromSlug(slug)
  
  return {
    title: t('meta_title', { name: proprieteName }),
    description: t('meta_description', { name: proprieteName }),
    keywords: t('meta_keywords'),
    openGraph: {
      title: t('meta_title', { name: proprieteName }),
      description: t('meta_description', { name: proprieteName }),
      type: 'website',
      locale: 'fr_FR',
      siteName: 'Evadia',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title', { name: proprieteName }),
      description: t('meta_description', { name: proprieteName }),
    },
    alternates: {
      canonical: `https://evadia.com/propriete/${slug}`,
    },
  }
}

export default async function ProprietePage({ params }: PageProps) {
  const { slug } = await params
  const proprieteId = decodeIdFromSlug(slug)
  const proprieteName = getNameFromSlug(slug)
  
  return <ProprieteClient proprieteId={proprieteId} proprieteName={proprieteName} slug={slug} />
}