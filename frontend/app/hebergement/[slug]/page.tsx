import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import HebergementName from './HebergementName'
import { decodeIdFromSlug, getNameFromSlug } from '@/lib/slug'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations('Hebergement')
  const { slug } = await params
  const categoryName = getNameFromSlug(slug)
  
  return {
    title: `${categoryName} | ${t('meta_title')}`,
    description: t('meta_description'),
    keywords: t('meta_keywords'),
  }
}

export default async function HebergementSlugPage({ params }: PageProps) {
  const { slug } = await params
  const categoryId = decodeIdFromSlug(slug)
  const categoryName = getNameFromSlug(slug)
  
  return <HebergementName categoryId={categoryId} categoryName={categoryName} slug={slug} />
}