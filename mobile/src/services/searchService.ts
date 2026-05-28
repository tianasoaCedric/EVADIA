import { api, API_BASE_URL } from "../lib/api";

function normalizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}/storage/${url}`;
}

export interface SearchHotelResult {
  id: string;
  nom: string;
  ville: string;
  pays: string;
  etoiles: number;
  photo: string | undefined;
  prix_min: number;
  note_moyenne: number | null;
}

export interface SearchResults {
  hotels: SearchHotelResult[];
  destinations: { id: string; nom: string; image_url?: string }[];
  villes: { id: string; nom: string; destination_nom: string }[];
}

export async function search(query: string): Promise<SearchResults> {
  if (!query.trim()) return { hotels: [], destinations: [], villes: [] };
  const { data } = await api.get("/search", { params: { q: query } });
  return {
    hotels: (data.hotels ?? []).map((h: any) => ({
      id: String(h.id),
      nom: h.nom,
      ville: h.ville ?? "",
      pays: h.pays ?? "Madagascar",
      etoiles: h.etoiles ?? 0,
      photo: normalizeUrl(h.photo_principale),
      prix_min: h.prix_min_mga ?? 0,
      note_moyenne: h.note_moyenne ?? null,
    })),
    destinations: (data.destinations ?? []).map((d: any) => ({
      id: String(d.id),
      nom: d.nom,
      image_url: normalizeUrl(d.image_url),
    })),
    villes: (data.villes ?? []).map((v: any) => ({
      id: String(v.id),
      nom: v.nom,
      destination_nom: v.destination_nom ?? "",
    })),
  };
}
