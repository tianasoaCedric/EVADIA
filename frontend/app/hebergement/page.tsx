import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import HebergementClient from './HebergementClient'
import { typeHotelService } from '@/lib/services'

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Hebergement')

    return {
        title: t('meta_title'),
        description: t('meta_description'),
        keywords: t('meta_keywords'),
    }
}

export default async function Hebergement() {
    const categories = await typeHotelService.list().catch(() => [])
    return <HebergementClient initialCategories={categories} />
}
