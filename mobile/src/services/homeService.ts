import { api, API_BASE_URL } from "../lib/api";

export interface HotelItem {
  id: string;
  nom: string;
  ville: string;
  pays: string;
  photo: string | undefined;
  prix_min: number;
  devise: string;
  note_moyenne: number | null;
  types: { id: number; nom: string }[];
}

export interface VilleItem {
  id: number;
  nom: string;
  nb_reservations: number;
}

function normalizePhoto(photo: string | null | undefined): string | undefined {
  if (!photo) return undefined;
  if (photo.startsWith("http")) return photo;
  return `${API_BASE_URL}/storage/${photo}`;
}

function mapHotel(h: any): HotelItem {
  return {
    id: String(h.id),
    nom: h.nom,
    ville: h.adresse?.ville ?? "",
    pays: h.adresse?.pays ?? "Madagascar",
    photo: normalizePhoto(h.photo_principale ?? h.photo ?? h.photos?.[0]?.url ?? null),
    prix_min: h.prix_min ?? 0,
    devise: h.devise_principale ?? "Ar",
    note_moyenne: h.note_moyenne ?? null,
    types: h.types ?? [],
  };
}

export interface TypeHotel {
  id: number;
  nom: string;
}

export async function getTypesHotels(): Promise<TypeHotel[]> {
  const { data } = await api.get("/types-hotels");
  return data.data ?? [];
}

// Hôtels mis en avant selon leur abonnement (signature = plus cher)
export async function getSelectionHotels(): Promise<HotelItem[]> {
  const { data } = await api.get("/hotels", {
    params: { selection: true, per_page: 20 },
  });
  const list = Array.isArray(data) ? data : (data.data ?? []);
  return list.map(mapHotel);
}

// Villes triées par nombre de réservations (populaire), fallback : nb hôtels
export async function getPopularVilles(limit = 5): Promise<VilleItem[]> {
  const { data } = await api.get("/villes/popular");
  const list = Array.isArray(data) ? data : (data.data ?? []);
  return list.slice(0, limit);
}

export interface ChambreItem {
  id: number;
  nom: string;
  type_propriete: string;
  capacite: number;
  nb_lits: number;
  nb_salles_bain: number;
  superficie: number | null;
  prix_par_nuit: number | null;
  devise: string | null;
  photos: string[];
}

export interface AvisItem {
  id: number;
  note: number;
  commentaire: string;
  date_avis: string;
  client: { prenom: string; nom: string; photo_profil: string | null };
  propriete: { nom: string };
}

export interface HotelDetail {
  id: number;
  nom: string;
  description: string | null;
  etoiles: number;
  email_contact: string | null;
  telephone: string | null;
  adresse: { ville: string; pays: string; adresse_ligne1?: string } | null;
  photos: { url_photo: string }[];
  chambres: ChambreItem[];
  services: { id: number; nom: string }[];
  note_moyenne: number | null;
  nb_avis: number;
}

export async function getHotelDetail(id: string): Promise<HotelDetail> {
  const { data } = await api.get(`/client/hotels/${id}`);
  return {
    ...data.hotel,
    photos: (data.photos ?? []).map((p: any) => ({
      url_photo: normalizePhoto(p.url_photo) ?? "",
    })),
    chambres: (data.chambres ?? []).map((c: any) => ({
      ...c,
      photos: (c.photos ?? []).map((url: string) => normalizePhoto(url) ?? url),
    })),
    services: data.services ?? [],
    note_moyenne: data.note_moyenne,
    nb_avis: data.nb_avis ?? 0,
    adresse: data.hotel.adresse ?? null,
  };
}

export async function getHotelAvis(id: string): Promise<AvisItem[]> {
  const { data } = await api.get(`/hotels/${id}/reviews`);
  return data.data ?? [];
}

// Hôtels d'une ville, triés par popularité (nb réservations)
export async function getVilleHotels(villeId: number): Promise<HotelItem[]> {
  const { data } = await api.get(`/villes/${villeId}/hotels`, {
    params: { popular: true, per_page: 20 },
  });
  const list = Array.isArray(data) ? data : (data.data ?? []);
  return list.map(mapHotel);
}
