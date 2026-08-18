import { api } from "./api";
import type { ProprieteDetail } from "./types";

export const proprietesApi = {
  async detail(id: number): Promise<ProprieteDetail> {
    const res = await api.get<ProprieteDetail>(`/proprietes/${id}`);
    return res.data;
  },
};
