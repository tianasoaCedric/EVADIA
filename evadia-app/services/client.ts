import { api } from "../lib/api";
import type { Hotel, Avis } from "./public";

export interface Reservation {
  id: number;
  hotel?: Hotel;
  propriete?: { id: number; nom: string };
  check_in: string;
  check_out: string;
  nb_adultes?: number;
  montant_total: number;
  statut: "pending" | "confirmed" | "cancelled";
  code_promo?: string;
  remise?: number;
  created_at?: string;
}

export interface Favori {
  id: number;
  hotel: Hotel;
}

export interface ClientProfile {
  id: number;
  name?: string;
  nom?: string;
  prenom?: string;
  email: string;
  telephone?: string;
  avatar?: string | null;
}

export const clientService = {
  async getReservations(): Promise<Reservation[]> {
    const res = await api.get("/client/reservations");
    return Array.isArray(res.data) ? res.data : res.data.data ?? [];
  },

  async getReservation(id: number): Promise<Reservation> {
    const res = await api.get(`/client/reservations/${id}`);
    return res.data;
  },

  async createReservation(data: {
    propriete_id: number;
    check_in: string;
    check_out: string;
    nb_adultes?: number;
    code_promo?: string;
  }): Promise<Reservation> {
    const res = await api.post("/client/reservations", data);
    return res.data;
  },

  async cancelReservation(id: number): Promise<void> {
    await api.patch(`/client/reservations/${id}/cancel`, {});
  },

  async verifyPromo(code: string): Promise<{ valide: boolean; remise_pct?: number }> {
    const res = await api.get(`/client/promo/${encodeURIComponent(code)}`);
    return res.data;
  },

  async getFavorites(): Promise<Favori[]> {
    const res = await api.get("/client/favorites");
    return Array.isArray(res.data) ? res.data : res.data.data ?? [];
  },

  async addFavorite(hotelId: number): Promise<void> {
    await api.post("/client/favorites", { hotel_id: hotelId });
  },

  async removeFavorite(hotelId: number): Promise<void> {
    await api.delete(`/client/favorites/${hotelId}`);
  },

  async getMyReviews(): Promise<Avis[]> {
    const res = await api.get("/client/reviews");
    return res.data;
  },

  async postReview(data: { hotel_id: number; note: number; commentaire?: string }): Promise<Avis> {
    const res = await api.post("/client/reviews", data);
    return res.data;
  },

  async getProfile(): Promise<ClientProfile> {
    const res = await api.get("/client/profile");
    return res.data;
  },

  async updateProfile(data: Partial<ClientProfile>): Promise<ClientProfile> {
    const res = await api.put("/client/profile", data);
    return res.data;
  },

  async updatePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    await api.put("/client/profile/password", data);
  },
};
