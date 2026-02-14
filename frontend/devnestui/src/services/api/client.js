import { API_BASE_URL } from "../../config/api";

async function parseBody(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

async function request(method, path, { signal, body, headers } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    signal,
    credentials: "include",
    headers,
    body,
  });

  if (!res.ok) {
    const parsed = await parseBody(res).catch(() => "");
    const msg =
      typeof parsed === "string"
        ? parsed
        : (parsed?.message || "");

    const err = new Error(`${method} ${path} failed: ${res.status} ${msg}`.trim());
    err.status = res.status;
    err.payload = parsed; // important for UI messages
    throw err;
  }

  if (res.status === 204) return null;
  return parseBody(res);
}

export function apiGet(path, opts) {
  return request("GET", path, opts);
}

// JSON POST (unchanged behavior)
export function apiPost(path, body, opts) {
  return request("POST", path, {
    ...(opts || {}),
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

// multipart/form-data POST
export function apiPostForm(path, formData, opts) {
  // DO NOT set Content-Type here (browser sets boundary)
  return request("POST", path, {
    ...(opts || {}),
    headers: { ...(opts?.headers || {}) },
    body: formData,
  });
}