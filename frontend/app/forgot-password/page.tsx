import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ForgotPasswordClient from './ForgotPasswordClient'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ForgotPassword')
  
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  }
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />
}