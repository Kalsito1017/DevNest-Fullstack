import axios from "axios";
import { API_CONFIG } from "./api";

const api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`,
  withCredentials: true,
  timeout: 20000,
  headers: { Accept: "application/json" },
});

export const savedJobsService = {
  toggle: async (jobId) => {
    const res = await api.post(`/saved-jobs/${jobId}`);
    return res.data; // { saved: true/false }
  },

  list: async () => {
    const res = await api.get("/saved-jobs");
    return res.data; // JobCardDto[]
  },

  // optional (ако добавиш endpoint за ids)
  ids: async () => {
    const res = await api.get("/saved-jobs/ids");
    return res.data; // int[]
  },
};
