import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { createSlug } from '@/lib/slug'
import { hotelService, destinationService } from '@/lib/services'

export const dynamic = 'force-dynamic'

const STATIC_PATHS = ['', '/decouvrir', '/destination', '/hebergement', '/offre']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }))

  const [hotelEntries, destinationEntries] = await Promise.all([
    fetchHotelEntries(),
    fetchDestinationEntries(),
  ])

  return [...staticEntries, ...destinationEntries, ...hotelEntries]
}

async function fetchHotelEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const entries: MetadataRoute.Sitemap = []
    let page = 1
    let lastPage = 1

    do {
      const res = await hotelService.list({ page })
      for (const hotel of res.data) {
        entries.push({
          url: `${SITE_URL}/hotel/${createSlug(hotel.id, hotel.nom)}`,
          lastModified: new Date(),
        })
      }
      lastPage = res.last_page
      page++
    } while (page <= lastPage)

    return entries
  } catch {
    return []
  }
}

async function fetchDestinationEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await destinationService.list()
    return res.data.map((destination) => ({
      url: `${SITE_URL}/destination/${createSlug(destination.id, destination.nom)}`,
      lastModified: new Date(),
    }))
  } catch {
    return []
  }
}
