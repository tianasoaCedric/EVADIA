import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ProprieteClient from './ProprieteClient'
import { decodeIdFromSlug, getNameFromSlug } from '@/lib/slug'
import { proprieteService } from '@/lib/services/propriete.service'
import { SITE_URL } from '@/lib/site'

export const revalidate = 3600

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations('ProprietePage')
  const { slug } = await params
  const proprieteName = getNameFromSlug(slug)
  const proprieteId = decodeIdFromSlug(slug)
  const propriete = await proprieteService.get(proprieteId).catch(() => null)
  const image = propriete?.photos?.[0]?.url_photo

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
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title', { name: proprieteName }),
      description: t('meta_description', { name: proprieteName }),
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: `${SITE_URL}/propriete/${slug}`,
    },
  }
}

export default async function ProprietePage({ params }: PageProps) {
  const { slug } = await params
  const proprieteId = decodeIdFromSlug(slug)
  const proprieteName = getNameFromSlug(slug)
  const propriete = await proprieteService.get(proprieteId).catch(() => null)

  const jsonLd = propriete
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: propriete.nom,
        description: propriete.description,
        image: propriete.photos?.map((p) => p.url_photo),
        offers: propriete.prix_par_nuit
          ? {
              '@type': 'Offer',
              price: propriete.prix_par_nuit,
              priceCurrency: propriete.devise ?? 'MGA',
              availability: 'https://schema.org/InStock',
              url: `${SITE_URL}/propriete/${slug}`,
            }
          : undefined,
        brand: propriete.hotel
          ? {
              '@type': 'Hotel',
              name: propriete.hotel.nom,
            }
          : undefined,
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
      <ProprieteClient proprieteId={proprieteId} proprieteName={proprieteName} slug={slug} />
    </>
  )
}