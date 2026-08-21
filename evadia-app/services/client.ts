import { api } from "../lib/api";
import type { Hotel, Avis } from "./public";

export interface Reservation {
  id: number;
  code_reservation?: string;
  hotel?: Hotel;
  propriete?: { id: number; nom: string; hotel?: Hotel };
  date_debut: string;
  date_fin: string;
  nb_adultes?: number;
  prix_total: number;
  statut: "en_attente" | "acceptee" | "refusee" | "annulee" | "terminee";
  code_promo?: string;
  remise?: number;
  montant_acompte?: number | null;
  statut_paiement_acompte?: "non_requis" | "en_attente" | "paye";
  created_at?: string;
}

export interface ReservationMessage {
  id: number;
  expediteur_id: number;
  destinataire_id: number;
  reservation_id: number;
  type: "texte" | "systeme" | "choix_paiement";
  sujet?: string | null;
  contenu: string;
  metadata?: Record<string, any> | null;
  lu: boolean;
  date_envoi: string;
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
    return res.data?.data ?? [];
  },

  async getReservation(id: number): Promise<Reservation> {
    const res = await api.get(`/client/reservations/${id}`);
    return res.data.data;
  },

  async createReservation(data: {
    propriete_id: number;
    date_debut: string;
    date_fin: string;
    nb_adultes: number;
    code_promo?: string;
  }): Promise<Reservation> {
    const res = await api.post("/client/reservations", data);
    return res.data;
  },

  async cancelReservation(id: number): Promise<void> {
    await api.patch(`/client/reservations/${id}/cancel`, {});
  },

  async getReservationMessages(reservationId: number): Promise<{ data: ReservationMessage[]; chat_ferme: boolean }> {
    const res = await api.get(`/client/reservations/${reservationId}/messages`);
    return res.data;
  },

  async sendReservationMessage(reservationId: number, contenu: string): Promise<ReservationMessage> {
    const res = await api.post(`/client/reservations/${reservationId}/messages`, { contenu });
    return res.data.data ?? res.data;
  },

  async choisirPaiement(
    reservationId: number,
    modePaiement: "mobile_money" | "carte_bancaire" | "especes_arrivee"
  ): Promise<ReservationMessage> {
    const res = await api.post(`/client/reservations/${reservationId}/messages/paiement`, { mode_paiement: modePaiement });
    return res.data.data ?? res.data;
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
