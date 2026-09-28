import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Appelé par Laravel (réseau Docker interne) après une modification de contenu
// dans le back office (photo de ville / destination…) pour que le site affiche
// la nouvelle version sans attendre l'expiration des `revalidate`.
// Non exposé publiquement : nginx envoie tout /api/* vers Laravel.
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET

  if (!secret || req.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
  }

  // Tout le site : les villes et destinations apparaissent sur l'accueil,
  // /destination, /ville/[slug], la recherche…
  revalidatePath('/', 'layout')

  return NextResponse.json({ revalidated: true, at: Date.now() })
}
