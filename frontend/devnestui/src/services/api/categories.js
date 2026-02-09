import { apiGet } from "./client";

export async function getCategories() {
  const data = await apiGet("/categories");
  return Array.isArray(data) ? data : [];
}

export async function getCategoryBySlug(slug) {
  return apiGet(`/categories/${encodeURIComponent(slug)}`);
}
