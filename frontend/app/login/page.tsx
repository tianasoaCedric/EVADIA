import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import LoginClient from './LoginClient'

// Métadonnées dynamiques avec traduction
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Login')
  
  return {
    title: t('meta_title'),
    description: t('meta_description'),
    keywords: t('meta_keywords'),
    openGraph: {
      title: t('meta_title'),
      description: t('meta_description'),
      type: 'website',
      locale: 'fr_FR',
      siteName: 'Evadia',
    },
  }
}

// Composant serveur qui importe le composant client
export default function LoginPage() {
  return <LoginClient />
}