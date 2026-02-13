import axios from "axios";
import { API_CONFIG } from "./api";

const apiClient = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`, // http://localhost:5099/api
  withCredentials: true,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const savedEventsService = {
  mine: async () => {
    const res = await apiClient.get("/saved-events");
    return res.data; // SavedEventDto[]
  },

  toggle: async (eventId) => {
    const res = await apiClient.post(`/saved-events/${eventId}`);
    return res.data; // { saved: boolean }
  },

  isSaved: async (eventId) => {
    const res = await apiClient.get(`/saved-events/${eventId}/is-saved`);
    return res.data; // { saved: boolean }
  },
};

export default savedEventsService;
