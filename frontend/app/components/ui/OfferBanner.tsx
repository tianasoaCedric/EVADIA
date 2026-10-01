'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Tag, AlertCircle } from 'lucide-react'
import { createSlug } from '@/lib/slug'
import type { OffreDetail } from '@/lib/services'

interface OfferBannerProps {
  offre: OffreDetail
  /** Message d'avertissement (offre non applicable à cette chambre, déjà utilisée…) */
  warning?: string | null
  /** Texte complémentaire (ex. réduction calculée pour les dates choisies) */
  detail?: string | null
}

/** Rappelle l'offre choisie jusqu'à la confirmation de la réservation. */
export default function OfferBanner({ offre, warning, detail }: OfferBannerProps) {
  const t = useTranslations('OfferBanner')

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${
        warning ? 'bg-amber-50 border-amber-200' : 'bg-[#01BDA5]/10 border-[#01BDA5]/30'
      }`}
    >
      {warning ? (
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      ) : (
        <Tag className="w-5 h-5 text-[#01BDA5] shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0 text-sm">
        <p className="font-semibold text-gray-800">
          {t('title', { titre: offre.titre })}
          {offre.discount > 0 && <span className="ml-2 text-[#01BDA5]">−{offre.discount}%</span>}
        </p>
        <p className={warning ? 'text-amber-700' : 'text-gray-600'}>
          {warning ?? detail ?? t('hint')}
        </p>
      </div>
      <Link
        href={`/offre/${createSlug(offre.id, offre.titre)}`}
        className="text-xs text-[#01BDA5] hover:underline shrink-0 mt-0.5"
      >
        {t('see_offer')}
      </Link>
    </div>
  )
}
