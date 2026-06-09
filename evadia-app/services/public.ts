import { api } from "../lib/api";

// ── Types bruts de l'API ───────────────────────────────────────────────────
// Les champs correspondent exactement à ce que le backend retourne.

export interface Hotel {
  id: number;
  // liste : "nom", détail : "hotel.nom"
  nom: string;
  description?: string;
  etoiles?: number | null;
  // liste : photo_principale (string), détail : photos[].url_photo
  photo_principale?: string | null;
  photos?: { url_photo: string; est_principale?: boolean; ordre?: number }[];
  // liste : adresse.ville (string) ou ville (string direct), détail : adresse.ville
  adresse?: { ville?: string; pays?: string; adresse_ligne1?: string; code_postal?: string } | null;
  ville?: string | null; // champ plat dans certains endpoints
  prix_min?: string | number | null;
  prix_min_mga?: string | number | null;
  note_moyenne?: string | number | null;
  nb_avis?: number;
  // détail seulement
  chambres?: Propriete[];
  services?: { id: number; nom: string; type_service?: string }[];
  types?: { id: number; nom: string }[];
}

export interface Propriete {
  id: number;
  nom: string;
  type_propriete?: string;
  description?: string;
  prix_par_nuit?: string | number;
  prix_mga?: string | number;
  prix_eur?: string | number;
  devise?: string;
  capacite?: number;
  nb_chambres?: number;
  nb_lits?: number;
  nb_salles_bain?: number;
  superficie?: number;
  photos?: string[] | { url: string }[];
}

export interface Destination {
  id: number;
  nom: string;
  description?: string;
  image_url?: string | null;
  hotels_count?: number;
}

export interface Ville {
  id: number;
  nom: string;
  slug?: string;
  destination?: Destination;
  image?: string;
}

export interface Offre {
  id: number;
  titre: string;
  description?: string;
  hotel_nom?: string;
  city?: string;
  destination?: string;
  photo?: string | null;
  discount?: number;
  reduction_pct?: number;
  date_debut?: string;
  date_fin?: string;
}

export interface Avis {
  id: number;
  note: number;
  commentaire?: string;
  user?: { name: string; avatar?: string };
  created_at?: string;
}

export interface DecouverteVille {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface LieuDecouverte {
  id: number;
  nom: string;
  description?: string;
  image?: string;
  adresse?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Retourne la ville lisible d'un hôtel (liste ou détail). */
export function hotelVille(h: Hotel): string {
  if (h.ville && typeof h.ville === "string") return h.ville;
  if (h.adresse?.ville) return h.adresse.ville;
  return "Madagascar";
}

/** Retourne la photo principale d'un hôtel. */
export function hotelPhoto(h: Hotel): string {
  const fallback =
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800";
  if (h.photo_principale) return h.photo_principale;
  if (h.photos && h.photos.length > 0) return h.photos[0].url_photo;
  return fallback;
}

/** Retourne toutes les photos d'un hôtel. */
export function hotelPhotos(h: Hotel): string[] {
  const fallback =
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800";
  if (h.photos && h.photos.length > 0) return h.photos.map((p) => p.url_photo);
  if (h.photo_principale) return [h.photo_principale];
  return [fallback];
}

/** Retourne le prix minimum numérique d'un hôtel. */
export function hotelPrix(h: Hotel): number {
  const raw = h.prix_min_mga ?? h.prix_min;
  if (!raw) return 0;
  return typeof raw === "number" ? raw : parseFloat(raw) || 0;
}

/** Retourne la note numérique d'un hôtel. */
export function hotelNote(h: Hotel): number {
  const raw = h.note_moyenne;
  if (!raw) return 0;
  return typeof raw === "number" ? raw : parseFloat(raw as string) || 0;
}

/** Retourne le prix d'une propriete/chambre en nombre. */
export function proprietePrix(p: Propriete): number {
  const raw = p.prix_mga ?? p.prix_par_nuit;
  if (!raw) return 0;
  return typeof raw === "number" ? raw : parseFloat(raw as string) || 0;
}

/** Retourne les photos d'une propriété. */
export function proprietePhotos(p: Propriete): string[] {
  const fallback =
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800";
  if (!p.photos || p.photos.length === 0) return [fallback];
  if (typeof p.photos[0] === "string") return p.photos as string[];
  return (p.photos as { url: string }[]).map((x) => x.url);
}

// ── Service ────────────────────────────────────────────────────────────────

export const publicService = {
  async getHotels(params?: Record<string, any>): Promise<Hotel[]> {
    const res = await api.get("/hotels", { params });
    const raw = res.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  },

  async getHotel(id: number): Promise<Hotel> {
    const res = await api.get(`/hotels/${id}`);
    // Le détail retourne { hotel, photos, chambres, services, note_moyenne, nb_avis }
    const raw = res.data;
    if (raw?.hotel) {
      return {
        ...raw.hotel,
        photos: raw.photos ?? raw.hotel.photos ?? [],
        chambres: raw.chambres ?? [],
        services: raw.services ?? raw.hotel.services ?? [],
        note_moyenne: raw.note_moyenne ?? raw.hotel.note_moyenne,
        nb_avis: raw.nb_avis ?? raw.hotel.nb_avis,
      } as Hotel;
    }
    return raw as Hotel;
  },

  async getHotelReviews(id: number): Promise<Avis[]> {
    const res = await api.get(`/hotels/${id}/reviews`);
    return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
  },

  async getPropriete(id: number): Promise<Propriete> {
    const res = await api.get(`/proprietes/${id}`);
    return res.data;
  },

  async getDestinations(): Promise<Destination[]> {
    const res = await api.get("/destinations");
    if (Array.isArray(res.data)) return res.data;
    return res.data?.data ?? [];
  },

  async getPopularVilles(): Promise<Ville[]> {
    const res = await api.get("/villes/popular");
    return Array.isArray(res.data) ? res.data : [];
  },

  async searchVilles(q: string): Promise<Ville[]> {
    const res = await api.get("/villes/search", { params: { q } });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getVillesByDestination(destinationId: number): Promise<Ville[]> {
    const res = await api.get(`/destinations/${destinationId}/villes`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async getHotelsByVille(villeId: number): Promise<Hotel[]> {
    const res = await api.get(`/villes/${villeId}/hotels`);
    if (Array.isArray(res.data)) return res.data;
    return res.data?.data ?? [];
  },

  async getHotelsByDestination(destinationId: number): Promise<Hotel[]> {
    const res = await api.get(`/destinations/${destinationId}/hotels`);
    if (Array.isArray(res.data)) return res.data;
    return res.data?.data ?? [];
  },

  async getOffres(): Promise<Offre[]> {
    const res = await api.get("/offres");
    if (Array.isArray(res.data)) return res.data;
    return res.data?.data ?? [];
  },

  async getOffre(id: number): Promise<Offre> {
    const res = await api.get(`/offres/${id}`);
    return res.data;
  },

  async getTypesHotels(): Promise<{ id: number; nom: string }[]> {
    const res = await api.get("/types-hotels");
    return Array.isArray(res.data) ? res.data : [];
  },

  async search(params: Record<string, any>): Promise<{ hotels: Hotel[]; total: number }> {
    const res = await api.get("/search", { params });
    return res.data;
  },

  async getDecouverteVilles(): Promise<DecouverteVille[]> {
    const res = await api.get("/decouverte/villes");
    return Array.isArray(res.data) ? res.data : [];
  },

  async getDecouverteLieux(slug: string): Promise<LieuDecouverte[]> {
    const res = await api.get(`/decouverte/villes/${slug}/lieux`);
    return Array.isArray(res.data) ? res.data : [];
  },
};
