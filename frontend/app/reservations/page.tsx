import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ReservationsClient from './ReservationsClient'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ReservationsPage')
  
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  }
}

export default function ReservationsPage() {
  return <ReservationsClient />
}