import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import DiscoverArticleClient from './DiscoverArticleClient'
import { decouverteService } from '@/lib/services'

export const revalidate = 300

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations('DiscoverArticlePage')
  const { slug } = await params

  return {
    title: t('meta_title', { name: slug }),
    description: t('meta_description', { name: slug }),
    openGraph: {
      title: t('meta_title', { name: slug }),
      description: t('meta_description', { name: slug }),
      type: 'article',
      locale: 'fr_FR',
      siteName: 'Evadia',
    },
  }
}

export default async function DiscoverArticlePage({ params }: PageProps) {
  const { slug } = await params
  const initialData = await decouverteService.getLieux(slug).catch(() => null)

  return <DiscoverArticleClient slug={slug} initialVille={initialData?.ville ?? null} initialLieux={initialData?.lieux ?? []} />
}
