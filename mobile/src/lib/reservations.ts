import { api } from "./api";
import type { Reservation, StatutReservation } from "./types";

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
}

export interface CreateReservationPayload {
  propriete_id: number;
  date_debut: string; // YYYY-MM-DD
  date_fin: string; // YYYY-MM-DD
  nb_adultes: number;
  nb_enfants?: number;
  nb_bebes?: number;
  demande_speciale?: string;
  code_promo?: string;
  devise?: "MGA" | "EUR";
}

export const reservationsApi = {
  async list(statut?: StatutReservation): Promise<Reservation[]> {
    const res = await api.get<PaginatedResponse<Reservation>>("/client/reservations", {
      params: statut ? { statut } : undefined,
    });
    return res.data.data;
  },

  async get(id: number): Promise<Reservation> {
    const res = await api.get<{ data: Reservation }>(`/client/reservations/${id}`);
    return res.data.data;
  },

  async create(payload: CreateReservationPayload) {
    const res = await api.post<{ message: string; data: { id: number; code_reservation: string } }>(
      "/client/reservations",
      payload
    );
    return res.data.data;
  },
};
