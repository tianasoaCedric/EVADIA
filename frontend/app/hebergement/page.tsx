import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import HebergementClient from './HebergementClient'

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Hebergement')
    
    return {
        title: t('meta_title'),
        description: t('meta_description'),
        keywords: t('meta_keywords'),
    }
}

export default function Hebergement() {
    return <HebergementClient />
}
