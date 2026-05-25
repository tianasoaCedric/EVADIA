import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ResetPasswordClient from './ResetPasswordClient'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ResetPassword')
  
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  }
}

export default function ResetPasswordPage() {
  return <ResetPasswordClient />
}