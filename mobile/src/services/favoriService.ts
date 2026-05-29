import { api, API_BASE_URL } from "../lib/api";

function normalizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}/storage/${url}`;
}

export interface FavoriItem {
  favoriId: number;
  hotelId: number;
  nom: string;
  ville: string;
  photo: string | undefined;
  prix_min: number;
  devise: string;
  note_moyenne: number | null;
  etoiles: number;
}

export async function getFavoris(): Promise<FavoriItem[]> {
  const { data } = await api.get("/client/favorites");
  const list = Array.isArray(data) ? data : (data.data ?? []);
  return list.map((f: any) => ({
    favoriId: f.id,
    hotelId: f.hotel_id,
    nom: f.hotel?.nom ?? "",
    ville: f.hotel?.adresse?.ville ?? "",
    photo: normalizeUrl(f.hotel?.photo_principale),
    prix_min: f.hotel?.prix_min ?? f.hotel?.prix_min_mga ?? 0,
    devise: "Ar",
    note_moyenne: f.hotel?.note_moyenne ?? null,
    etoiles: f.hotel?.etoiles ?? 0,
  }));
}

export async function addFavori(hotelId: number): Promise<void> {
  await api.post("/client/favorites", { hotel_id: hotelId });
}

export async function removeFavori(hotelId: number): Promise<void> {
  await api.request({ method: "DELETE", url: `/client/favorites/${hotelId}` });
}
