import axios from "axios";
import { API_CONFIG } from "./api";

const apiClient = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`,
  withCredentials: true,
  timeout: 20000,
});

const filenameFromDisposition = (cd) => {
  if (!cd) return null;
  const m1 = cd.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (m1?.[1]) return decodeURIComponent(m1[1].replace(/["']/g, ""));
  const m2 = cd.match(/filename\s*=\s*"?([^"]+)"?/i);
  if (m2?.[1]) return m2[1];
  return null;
};

export const filesService = {
  list: async () => {
    const res = await apiClient.get("/files");
    return res.data;
  },

  upload: async (file) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await apiClient.post("/files", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },

  remove: async (id) => {
    await apiClient.delete(`/files/${id}`);
  },

  download: async (id) => {
    const res = await apiClient.get(`/files/${id}/download`, {
      responseType: "blob",
    });

    const contentType = res.headers["content-type"] || "application/octet-stream";
    const fileName =
      filenameFromDisposition(res.headers["content-disposition"]) || `file_${id}`;

    const blob = new Blob([res.data], { type: contentType });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
