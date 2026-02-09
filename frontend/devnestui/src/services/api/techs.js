import { apiGet } from "./client";

export async function getTechs() {
  const data = await apiGet("/techs");
  return Array.isArray(data) ? data : [];
}

export async function getTechBySlug(slug) {
  return apiGet(`/techs/${encodeURIComponent(slug)}`);
}
