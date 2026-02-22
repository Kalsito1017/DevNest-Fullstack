import axios from "axios";
import { API_CONFIG } from "./api";

const apiClient = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`,
  withCredentials: true, // important for cookie auth
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const authService = {
  // -----------------------
  // Auth
  // -----------------------

  me: async () => {
    const res = await apiClient.get("/auth/me");
    return res.data;
  },

  login: async ({ email, password }) => {
    await apiClient.post("/auth/login", { email, password });
    return authService.me(); // cookie is set by backend
  },

  register: async ({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  }) => {
    await apiClient.post("/auth/register", {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    });
    return authService.me();
  },

  logout: async () => {
    await apiClient.post("/auth/logout");
  },

  // -----------------------
  // Password flows
  // -----------------------

  changePassword: async ({ currentPassword, newPassword }) => {
    const res = await apiClient.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await apiClient.post("/auth/forgot-password", {
      email,
    });
    return res.data; // { ok: true }
  },

  resetPassword: async ({ email, token, newPassword }) => {
    const res = await apiClient.post("/auth/reset-password", {
      email,
      token,
      newPassword,
    });
    return res.data; // { ok: true }
  },
};

export default authService;
