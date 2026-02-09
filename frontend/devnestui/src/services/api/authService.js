import axios from "axios";
import { API_CONFIG } from "./api";

const apiClient = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`, // напр. http://localhost:5099/api
  withCredentials: true,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const authService = {
  me: async () => {
    const res = await apiClient.get("/auth/me");
    return res.data; // { id, email, firstName, lastName, roles }
  },

  login: async ({ email, password }) => {
    await apiClient.post("/auth/login", { email, password });
    return await authService.me();
  },

  register: async ({ firstName, lastName, email, password }) => {
    await apiClient.post("/auth/register", { firstName, lastName, email, password });
    return await authService.me();
  },

  logout: async () => {
    await apiClient.post("/auth/logout");
  },
   changePassword: async ({ currentPassword, newPassword }) => {
    const res = await apiClient.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return res.data; // { message: "Password changed." } (or whatever you return)
  },
};

export default authService;
