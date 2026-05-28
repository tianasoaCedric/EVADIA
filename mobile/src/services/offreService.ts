import { api, API_BASE_URL } from "../lib/api";

const MONTHS_FR = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

function normalizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}/storage/${url}`;
}

export interface OffreItem {
  id: string;
  titre: string;
  description: string;
  hotel_nom: string;
  city: string;
  destination: string;
  photo: string | undefined;
  discount: number;
  badge: string;
  date_debut: string;
  date_fin: string;
}

export interface OffreDetail extends OffreItem {
  phone: string | null;
  email: string | null;
  terms: string[];
}

function formatBadge(discount: number, startDay: number, endDay: number, monthNum: number): string {
  const month = MONTHS_FR[(monthNum - 1)] ?? "";
  return `Offres -${discount}% du ${startDay} au ${endDay} ${month}`;
}

function mapOffre(o: any): OffreItem {
  return {
    id: String(o.id),
    titre: o.titre,
    description: o.description,
    hotel_nom: o.hotel_nom,
    city: o.city ?? "",
    destination: o.destination ?? "",
    photo: normalizeUrl(o.photo),
    discount: o.discount ?? 0,
    badge: formatBadge(o.discount ?? 0, o.start_day, o.end_day, o.month_num),
    date_debut: o.date_debut,
    date_fin: o.date_fin,
  };
}

export async function getOffres(): Promise<OffreItem[]> {
  const { data } = await api.get("/offres");
  const list = Array.isArray(data) ? data : (data.data ?? []);
  return list.map(mapOffre);
}

export async function getOffreDetail(id: string): Promise<OffreDetail> {
  const { data } = await api.get(`/offres/${id}`);
  return {
    ...mapOffre(data),
    phone: data.phone ?? null,
    email: data.email ?? null,
    terms: Array.isArray(data.terms) ? data.terms : [],
  };
}
