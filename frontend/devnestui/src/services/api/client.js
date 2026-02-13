import { API_BASE_URL } from "../../config/api";

async function parseBody(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

async function request(method, path, { signal, body } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    signal,
    credentials: "include", // ✅ IMPORTANT
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const parsed = await parseBody(res).catch(() => "");
    const msg = typeof parsed === "string" ? parsed : "";
    const err = new Error(`${method} ${path} failed: ${res.status} ${msg}`);
    err.status = res.status; // ✅ for easy 401 handling
    throw err;
  }

  if (res.status === 204) return null;
  return parseBody(res);
}

export function apiGet(path, opts) {
  return request("GET", path, opts);
}

export function apiPost(path, body, opts) {
  return request("POST", path, { ...(opts || {}), body });
}
