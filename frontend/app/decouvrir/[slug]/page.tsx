import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import DiscoverArticleClient from './DiscoverArticleClient'
import { decodeIdFromSlug, getNameFromSlug } from '@/lib/slug'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations('DiscoverArticlePage')
  const { slug } = await params
  const articleName = getNameFromSlug(slug)
  
  return {
    title: t('meta_title', { name: articleName }),
    description: t('meta_description', { name: articleName }),
    openGraph: {
      title: t('meta_title', { name: articleName }),
      description: t('meta_description', { name: articleName }),
      type: 'article',
      locale: 'fr_FR',
      siteName: 'Evadia',
    },
  }
}

export default async function DiscoverArticlePage({ params }: PageProps) {
  const { slug } = await params
  const articleId = decodeIdFromSlug(slug)
  const articleName = getNameFromSlug(slug)
  
  return <DiscoverArticleClient articleId={articleId} articleName={articleName} slug={slug} />
}