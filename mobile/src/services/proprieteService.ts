import { api, API_BASE_URL } from "../lib/api";

function normalizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}/storage/${url}`;
}

export interface EquipementItem {
  id: number;
  nom: string;
  categorie: string | null;
  icone: string | null;
}

export interface ProprieteDetail {
  id: number;
  nom: string;
  description: string | null;
  type_propriete: string;
  capacite: number;
  nb_lits: number;
  nb_salles_bain: number;
  superficie: number | null;
  prix_par_nuit: number | null;
  devise: string | null;
  prix_mga: number | null;
  photos: string[];
  equipements: EquipementItem[];
  hotel: {
    id: number;
    nom: string;
    etoiles: number;
    adresse: { ville: string; pays: string } | null;
  } | null;
}

export interface PlageIndisponible {
  debut: string;
  fin: string;
}

export async function getIndisponibilites(id: string): Promise<PlageIndisponible[]> {
  const { data } = await api.get(`/proprietes/${id}/indisponibilites`);
  return data.data ?? [];
}

export async function getPropriete(id: string): Promise<ProprieteDetail> {
  const { data } = await api.get(`/proprietes/${id}`);
  return {
    ...data,
    photos: (data.photos ?? []).map((p: any) =>
      normalizeUrl(typeof p === "string" ? p : p.url_photo) ?? ""
    ).filter(Boolean),
    equipements: data.equipements ?? [],
  };
}
