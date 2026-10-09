import { api } from "./api";
import type { ReservationMessage, ReservationMessagesResponse } from "./types";

export const chatboxApi = {
  async messages(reservationId: number): Promise<ReservationMessagesResponse> {
    const res = await api.get<ReservationMessagesResponse>(
      `/client/reservations/${reservationId}/messages`
    );
    return res.data;
  },

  async send(reservationId: number, contenu: string): Promise<ReservationMessage> {
    const res = await api.post<{ data: ReservationMessage }>(
      `/client/reservations/${reservationId}/messages`,
      { contenu }
    );
    return res.data.data;
  },

  async choisirPaiement(reservationId: number, modePaiement: string): Promise<ReservationMessage> {
    const res = await api.post<{ data: ReservationMessage }>(
      `/client/reservations/${reservationId}/messages/paiement`,
      { mode_paiement: modePaiement }
    );
    return res.data.data;
  },
};

export interface BroadcastingToken {
  token: string;
  expires_at: string;
}

export const broadcastingApi = {
  async issueToken(): Promise<BroadcastingToken> {
    const res = await api.post<BroadcastingToken>("/client/broadcasting-token", {});
    return res.data;
  },
};
