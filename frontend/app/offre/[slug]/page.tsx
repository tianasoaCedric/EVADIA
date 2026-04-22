import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import OfferDetailClient from './OfferDetailClient'
import { decodeIdFromSlug, getNameFromSlug } from '@/lib/slug'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations('OfferDetailPage')
  const { slug } = await params
  const offerName = getNameFromSlug(slug)
  
  return {
    title: t('meta_title', { name: offerName }),
    description: t('meta_description', { name: offerName }),
    openGraph: {
      title: t('meta_title', { name: offerName }),
      description: t('meta_description', { name: offerName }),
      type: 'website',
      locale: 'fr_FR',
      siteName: 'Evadia',
    },
  }
}

export default async function OfferDetailPage({ params }: PageProps) {
  const { slug } = await params
  const offerId = decodeIdFromSlug(slug)
  const offerName = getNameFromSlug(slug)
  
  return <OfferDetailClient offerId={offerId} offerName={offerName} slug={slug} />
}