import { api } from "./api";
import type { HotelSummary, HotelDetail } from "./types";

interface PaginatedResponse<T> {
  data: T[];
}

export const hotelsApi = {
  async byDestination(destinationId: number): Promise<HotelSummary[]> {
    const res = await api.get<PaginatedResponse<HotelSummary> | HotelSummary[]>(
      `/destinations/${destinationId}/hotels`
    );
    return Array.isArray(res.data) ? res.data : res.data.data;
  },

  async detail(hotelId: number): Promise<HotelDetail> {
    const res = await api.get<HotelDetail>(`/hotels/${hotelId}`);
    return res.data;
  },
};
