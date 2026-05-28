import { api } from "../lib/api";

export interface ReservationItem {
  id: number;
  code_reservation: string;
  hotel_nom: string;
  ville: string;
  date_debut: string;
  date_fin: string;
  prix_total: number;
  devise: string;
  statut: "draft" | "confirmee" | "terminee" | "annulee" | string;
  nb_adultes: number;
}

export interface CreateReservationPayload {
  propriete_id: number;
  date_debut: string;
  date_fin: string;
  nb_adultes: number;
  nb_enfants?: number;
  nb_bebes?: number;
  offre_id?: number;
}

export interface CreatedReservation {
  id: number;
  code_reservation: string;
  prix_total: number;
  statut: string;
  montant_reduction?: number;
  prix_avant_reduction?: number;
}

const STATUT_LABELS: Record<string, string> = {
  draft: "En attente",
  confirmee: "Confirmée",
  terminee: "Terminée",
  annulee: "Annulée",
};

export function statutLabel(statut: string): string {
  return STATUT_LABELS[statut] ?? statut;
}

export async function getReservations(): Promise<ReservationItem[]> {
  const { data } = await api.get("/client/reservations");
  const list = Array.isArray(data) ? data : (data.data ?? []);
  return list.map((r: any) => ({
    id: r.id,
    code_reservation: r.code_reservation,
    hotel_nom: r.propriete?.hotel?.nom ?? "Hôtel",
    ville: r.propriete?.hotel?.adresse?.ville ?? "",
    date_debut: r.date_debut,
    date_fin: r.date_fin,
    prix_total: parseFloat(r.prix_total ?? 0),
    devise: r.devise_prix_total ?? "Ar",
    statut: r.statut,
    nb_adultes: r.nb_adultes ?? 1,
  }));
}

export async function createReservation(payload: CreateReservationPayload): Promise<CreatedReservation> {
  const { data } = await api.post("/client/reservations", payload);
  return data.data ?? data;
}

export async function cancelReservation(id: number): Promise<void> {
  await api.patch(`/client/reservations/${id}/cancel`);
}
