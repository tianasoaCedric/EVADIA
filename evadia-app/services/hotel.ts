import { api } from "../lib/api";

export interface HotelDashboard {
  nb_reservations: number;
  revenus_mois: number;
  taux_occupation: number;
  nb_chambres: number;
}

export interface Room {
  id: number;
  nom: string;
  description?: string;
  prix_nuit: number;
  capacite_adultes?: number;
  nb_lits?: number;
  nb_salles_bain?: number;
  statut?: string;
  photos?: { id: number; url: string }[];
  equipements?: { id: number; name: string }[];
}

export interface HotelReservation {
  id: number;
  client?: { id: number; name: string; email: string };
  propriete?: { id: number; nom: string };
  check_in: string;
  check_out: string;
  montant_total: number;
  statut: string;
}

export interface CalendarEntry {
  date: string;
  propriete_id: number;
  disponible: boolean;
}

export interface HotelOffre {
  id: number;
  titre: string;
  description?: string;
  reduction_pct?: number;
  date_debut?: string;
  date_fin?: string;
  actif: boolean;
  photos?: { id: number; url: string }[];
}

export interface HotelMessage {
  id: number;
  contenu: string;
  lu: boolean;
  user?: { id: number; name: string };
  created_at?: string;
}

export interface Payment {
  id: number;
  montant: number;
  statut: string;
  reservation?: HotelReservation;
  created_at?: string;
}

// Le token est injecté automatiquement via l'intercepteur axios dans lib/api.ts

export const hotelService = {
  async getDashboard(): Promise<HotelDashboard> {
    const res = await api.get("/hotel/dashboard");
    return res.data;
  },

  async getRooms(): Promise<Room[]> {
    const res = await api.get("/hotel/rooms");
    return Array.isArray(res.data) ? res.data : res.data.data ?? [];
  },

  async getRoom(id: number): Promise<Room> {
    const res = await api.get(`/hotel/rooms/${id}`);
    return res.data;
  },

  async createRoom(data: Partial<Room>): Promise<Room> {
    const res = await api.post("/hotel/rooms", data);
    return res.data;
  },

  async updateRoom(id: number, data: Partial<Room>): Promise<Room> {
    const res = await api.put(`/hotel/rooms/${id}`, data);
    return res.data;
  },

  async deleteRoom(id: number): Promise<void> {
    await api.delete(`/hotel/rooms/${id}`);
  },

  async getReservations(): Promise<HotelReservation[]> {
    const res = await api.get("/hotel/reservations");
    return Array.isArray(res.data) ? res.data : res.data.data ?? [];
  },

  async getReservation(id: number): Promise<HotelReservation> {
    const res = await api.get(`/hotel/reservations/${id}`);
    return res.data;
  },

  async updateReservationStatus(id: number, statut: string): Promise<void> {
    await api.patch(`/hotel/reservations/${id}/status`, { statut });
  },

  async getCalendar(): Promise<CalendarEntry[]> {
    const res = await api.get("/hotel/calendar");
    return res.data;
  },

  async updateDisponibilite(data: { propriete_id: number; date: string; disponible: boolean }): Promise<void> {
    await api.post("/hotel/calendar/disponibilite", data);
  },

  async bulkUpdateCalendar(data: { propriete_id: number; dates: string[]; disponible: boolean }): Promise<void> {
    await api.post("/hotel/calendar/bulk", data);
  },

  async getOffres(): Promise<HotelOffre[]> {
    const res = await api.get("/hotel/offers");
    return Array.isArray(res.data) ? res.data : res.data.data ?? [];
  },

  async createOffre(data: Partial<HotelOffre>): Promise<HotelOffre> {
    const res = await api.post("/hotel/offers", data);
    return res.data;
  },

  async toggleOffre(id: number): Promise<void> {
    await api.patch(`/hotel/offers/${id}/toggle`, {});
  },

  async getMessages(): Promise<HotelMessage[]> {
    const res = await api.get("/hotel/messages");
    return Array.isArray(res.data) ? res.data : res.data.data ?? [];
  },

  async getConversation(userId: number): Promise<HotelMessage[]> {
    const res = await api.get(`/hotel/messages/conversation/${userId}`);
    return res.data;
  },

  async sendMessage(data: { user_id: number; contenu: string }): Promise<HotelMessage> {
    const res = await api.post("/hotel/messages", data);
    return res.data;
  },

  async getPayments(): Promise<Payment[]> {
    const res = await api.get("/hotel/payments");
    return Array.isArray(res.data) ? res.data : res.data.data ?? [];
  },

  async getPayment(id: number): Promise<Payment> {
    const res = await api.get(`/hotel/payments/${id}`);
    return res.data;
  },
};
