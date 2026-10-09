import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import HotelClient from './HotelClient'
import { hotelService } from '@/lib/services'
import { SITE_URL } from '@/lib/site'

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
  const hotelId = decodeIdFromSlug(slug)
  const hotelData = await hotelService.get(hotelId).catch(() => null)
  const image = hotelData?.hotel.photo_principale ?? hotelData?.photos?.[0]?.url_photo

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
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title', { hotelName }),
      description: t('meta_description', { hotelName }),
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: `${SITE_URL}/hotel/${slug}`,
    },
  }
}

export default async function HotelPage({ params }: PageProps) {
  const { slug } = await params
  const hotelId = decodeIdFromSlug(slug)
  const hotelName = getHotelNameFromSlug(slug)
  const initialHotelData = await hotelService.get(hotelId).catch(() => null)

  const jsonLd = initialHotelData
    ? {
        '@context': 'https://schema.org',
        '@type': 'Hotel',
        name: initialHotelData.hotel.nom,
        description: initialHotelData.hotel.description,
        starRating: {
          '@type': 'Rating',
          ratingValue: initialHotelData.hotel.etoiles,
        },
        image: initialHotelData.photos?.map((p) => p.url_photo),
        address: initialHotelData.hotel.adresse
          ? {
              '@type': 'PostalAddress',
              streetAddress: initialHotelData.hotel.adresse.adresse_ligne1,
              addressLocality: initialHotelData.hotel.adresse.ville,
              addressCountry: initialHotelData.hotel.adresse.pays,
            }
          : undefined,
        aggregateRating:
          initialHotelData.nb_avis > 0
            ? {
                '@type': 'AggregateRating',
                ratingValue: initialHotelData.note_moyenne ?? undefined,
                reviewCount: initialHotelData.nb_avis,
              }
            : undefined,
        url: `${SITE_URL}/hotel/${slug}`,
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <HotelClient hotelId={hotelId} hotelName={hotelName} slug={slug} initialHotelData={initialHotelData} />
    </>
  )
}