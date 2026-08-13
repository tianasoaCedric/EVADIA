import { api } from "../lib/api";

export interface AppNotification {
  id: number;
  user_id: number;
  type_notification: string;
  titre: string;
  contenu: string;
  lien?: string | null;
  lu: boolean;
  canal: string;
  reservation_id?: number | null;
  date_envoi: string;
  date_lecture?: string | null;
}

export const notificationService = {
  async getNotifications(): Promise<AppNotification[]> {
    const res = await api.get("/client/notifications");
    return Array.isArray(res.data) ? res.data : res.data?.data ?? [];
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get("/client/notifications/unread-count");
    return res.data?.count ?? 0;
  },

  async markRead(id: number): Promise<void> {
    await api.patch(`/client/notifications/${id}/read`, {});
  },

  async markAllRead(): Promise<void> {
    await api.patch("/client/notifications/read-all", {});
  },

  async registerDeviceToken(expoPushToken: string, platform?: string): Promise<void> {
    await api.post("/client/notifications/device-token", {
      expo_push_token: expoPushToken,
      platform,
    });
  },

  async unregisterDeviceToken(expoPushToken: string): Promise<void> {
    await api.delete("/client/notifications/device-token", {
      data: { expo_push_token: expoPushToken },
    });
  },
};
