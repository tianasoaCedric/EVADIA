import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import SearchClient from './SearchClient'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
  }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  const t = await getTranslations('SearchPage')
  
  return {
    title: q ? t('meta_title', { query: q }) : t('meta_title_default'),
    description: t('meta_description'),
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  
  return <SearchClient searchQuery={q || ''} />
}