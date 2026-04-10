import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ProprieteClient from './ProprieteClient'
import { decodeIdFromSlug, getNameFromSlug } from '@/lib/slug'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
//   const t = await getTranslations('Propriete')
//   const { slug } = await params
//   const proprieteName = getNameFromSlug(slug)
  
//   return {
//     title: `${proprieteName} | ${t('meta_title')}`,
//     description: t('meta_description'),
//   }
// }

export default async function ProprietePage({ params }: PageProps) {
  const { slug } = await params
  const proprieteId = decodeIdFromSlug(slug)
  const proprieteName = getNameFromSlug(slug)
  
  return <ProprieteClient proprieteId={proprieteId} proprieteName={proprieteName} slug={slug} />
}