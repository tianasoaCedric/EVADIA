import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import CityClient from './CityClient'
import { decodeIdFromSlug, getNameFromSlug } from '@/lib/slug'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations('CityPage')
  const { slug } = await params
  const cityName = getNameFromSlug(slug)
  
  return {
    title: t('meta_title', { name: cityName }),
    description: t('meta_description', { name: cityName }),
  }
}

export default async function CityPage({ params }: PageProps) {
  const { slug } = await params
  const cityId = decodeIdFromSlug(slug)
  const cityName = getNameFromSlug(slug)
  
  return <CityClient cityId={cityId} cityName={cityName} slug={slug} />
}