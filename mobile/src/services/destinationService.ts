import { api, API_BASE_URL } from "../lib/api";
import { HotelItem } from "./homeService";

function normalizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}/storage/${url}`;
}

export interface DestinationItem {
  id: string;
  nom: string;
  description: string | null;
  image_url: string | undefined;
  hotels_count: number;
}

export interface VilleItem {
  id: string;
  nom: string;
  destination_id: string;
  description: string | null;
  image: string | undefined;
}

export interface DestinationWithVilles {
  destination: DestinationItem;
  villes: VilleItem[];
}

function mapHotel(h: any): HotelItem {
  const photo = h.photo_principale ?? h.photo ?? null;
  return {
    id: String(h.id),
    nom: h.nom,
    ville: h.adresse?.ville ?? h.ville ?? "",
    pays: h.adresse?.pays ?? "Madagascar",
    photo: normalizeUrl(photo),
    prix_min: h.prix_min ?? 0,
    devise: h.devise_principale ?? "Ar",
    note_moyenne: h.note_moyenne ?? null,
    types: h.types ?? [],
  };
}

export async function getDestinations(): Promise<DestinationItem[]> {
  const { data } = await api.get("/destinations");
  const list = Array.isArray(data) ? data : (data.data ?? []);
  return list.map((d: any) => ({
    id: String(d.id),
    nom: d.nom,
    description: d.description ?? null,
    image_url: normalizeUrl(d.image_url),
    hotels_count: d.hotels_count ?? 0,
  }));
}

export async function getDestinationVilles(destinationId: string): Promise<DestinationWithVilles> {
  const { data } = await api.get(`/destinations/${destinationId}/villes`);
  const d = data.data;
  return {
    destination: {
      id: String(d.destination.id),
      nom: d.destination.nom,
      description: d.destination.description ?? null,
      image_url: d.destination.image_url ?? undefined,
      hotels_count: 0,
    },
    villes: (d.villes ?? []).map((v: any) => ({
      id: String(v.id),
      nom: v.nom,
      destination_id: String(v.destination_id),
      description: v.description ?? null,
      image: v.image ?? undefined,
    })),
  };
}

export async function getAllVilles(): Promise<VilleItem[]> {
  const destinations = await getDestinations();
  const results = await Promise.all(destinations.map((d) => getDestinationVilles(d.id)));
  return results.flatMap((r) => r.villes);
}

export async function getDestinationHotels(destinationId: string): Promise<HotelItem[]> {
  const { data } = await api.get(`/destinations/${destinationId}/hotels`);
  const list = Array.isArray(data) ? data : (data.data ?? []);
  return list.map(mapHotel);
}

export async function getVilleHotelsById(villeId: string): Promise<HotelItem[]> {
  const { data } = await api.get(`/villes/${villeId}/hotels`, { params: { popular: true } });
  const list = Array.isArray(data) ? data : (data.data ?? []);
  return list.map(mapHotel);
}
