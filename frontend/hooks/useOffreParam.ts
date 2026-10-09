import { useEffect, useState } from 'react'
import { offreService, type OffreDetail } from '@/lib/services'

/**
 * Offre transmise par ?offre= depuis la page d'une offre (« Demander une réservation »).
 * null si absente, expirée, désactivée ou pas encore commencée.
 *
 * Lu après le montage plutôt qu'avec useSearchParams : sur une page ISR, ce
 * dernier ferait rendre tout le composant côté navigateur (contenu absent du
 * HTML servi, mauvais pour le référencement).
 */
export function useOffreParam(): OffreDetail | null {
  const [offre, setOffre] = useState<OffreDetail | null>(null)

  useEffect(() => {
    const offreId = Number(new URLSearchParams(window.location.search).get('offre'))
    if (!offreId) return
    let cancelled = false
    offreService.get(offreId)
      .then((o) => { if (!cancelled && o.en_cours) setOffre(o) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return offre
}
