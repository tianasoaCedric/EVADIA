import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import HebergementName from './HebergementName'
import { decodeIdFromSlug, getNameFromSlug } from '@/lib/slug'
import { hotelService, typeHotelService } from '@/lib/services'

export const revalidate = 60

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const t = await getTranslations('HebergementName')
  const categoryName = getNameFromSlug(slug)
  
  // Pour la catégorie "Hôtel de luxe", utiliser le titre spécifique
  const displayCategory = categoryName === 'Hôtel de luxe' 
    ? t('hotels_luxe_title') 
    : categoryName
  
  return {
    title: t('meta_title', { category: displayCategory }),
    description: t('meta_description', { category: categoryName.toLowerCase() }),
    keywords: t('meta_keywords', { category: categoryName.toLowerCase() }),
    openGraph: {
      title: t('meta_title', { category: displayCategory }),
      description: t('meta_description', { category: categoryName.toLowerCase() }),
      type: 'website',
      locale: 'fr_FR',
      siteName: 'Evadia',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title', { category: displayCategory }),
      description: t('meta_description', { category: categoryName.toLowerCase() }),
    }
  }
}

export default async function HebergementSlugPage({ params }: PageProps) {
  const { slug } = await params
  const categoryId = decodeIdFromSlug(slug)
  const categoryName = getNameFromSlug(slug)
  const [initialData, types] = await Promise.all([
    hotelService.list({ type_id: categoryId, page: 1 }).catch(() => undefined),
    typeHotelService.list().catch(() => []),
  ])
  const categoryType = types.find(t => t.id === categoryId)
  const categoryDescription = categoryType?.description ?? null
  const categoryImage = categoryType?.imageUrl ?? '/photos/bc.png'

  return <HebergementName categoryId={categoryId} categoryName={categoryName} slug={slug} initialData={initialData} categoryDescription={categoryDescription} categoryImage={categoryImage} />
}