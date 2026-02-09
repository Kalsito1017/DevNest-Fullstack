import { API_BASE_URL } from "../../config/api";

async function parseBody(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export async function apiGet(path, { signal } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, { method: "GET", signal });
  if (!res.ok) {
    const body = await parseBody(res).catch(() => "");
    throw new Error(`GET ${path} failed: ${res.status} ${typeof body === "string" ? body : ""}`);
  }
  return parseBody(res);
}
