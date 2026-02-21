import { API_BASE_URL } from "../../config/api";

async function parseBody(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

function buildUrl(pathOrUrl) {
  // If user passes full URL, use it as-is
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  
  const base = String(API_BASE_URL || "").replace(/\/+$/, "");
  const path = String(pathOrUrl || "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function request(method, pathOrUrl, { signal, body, headers } = {}) {
  const res = await fetch(buildUrl(pathOrUrl), {
    method,
    signal,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const parsed = await parseBody(res).catch(() => "");
    const msg =
      typeof parsed === "string"
        ? parsed
        : (parsed?.message || parsed?.title || "");

    const err = new Error(
      `${method} ${buildUrl(pathOrUrl)} failed: ${res.status} ${msg}`.trim()
    );
    err.status = res.status;
    err.payload = parsed;
    throw err;
  }

  // 204 no content
  if (res.status === 204) return null;

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export function sendReport(
  { reason, details, email = null, jobId = null, pageUrl = null },
  opts = {}
) {
  const payload = {
    reason,
    details,
    email: email || null,
    jobId: jobId ?? null,
    pageUrl: pageUrl || null,
  };
return request("POST", "/reports", { ...opts, body: payload });
}