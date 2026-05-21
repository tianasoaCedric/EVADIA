import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ProfileClient from './ProfileClient'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ProfilePage')
  
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  }
}

export default function ProfilePage() {
  return <ProfileClient />
}