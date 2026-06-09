import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import HotelClient from './HotelClient'
import { hotelService } from '@/lib/services'

export const revalidate = 3600

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Décoder l'ID depuis le slug (dernier segment)
const decodeIdFromSlug = (slug: string): number => {
  const encodedId = slug.split('-').pop() || '0'
  return parseInt(encodedId, 36)
}

// Extraire le nom depuis le slug (sans l'ID encodé)
const getHotelNameFromSlug = (slug: string): string => {
  const parts = slug.split('-')
  parts.pop()
  return parts.join(' ').replace(/-/g, ' ')
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const t = await getTranslations('HotelPage')
  const hotelName = getHotelNameFromSlug(slug)
  
  return {
    title: t('meta_title', { hotelName }),
    description: t('meta_description', { hotelName }),
    keywords: t('meta_keywords'),
    openGraph: {
      title: t('meta_title', { hotelName }),
      description: t('meta_description', { hotelName }),
      type: 'website',
      locale: 'fr_FR',
      siteName: 'Evadia',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title', { hotelName }),
      description: t('meta_description', { hotelName }),
    },
    alternates: {
      canonical: `https://evadia.com/hotel/${slug}`,
    },
  }
}

export default async function HotelPage({ params }: PageProps) {
  const { slug } = await params
  const hotelId = decodeIdFromSlug(slug)
  const hotelName = getHotelNameFromSlug(slug)
  const initialHotelData = await hotelService.get(hotelId).catch(() => null)

  return <HotelClient hotelId={hotelId} hotelName={hotelName} slug={slug} initialHotelData={initialHotelData} />
}