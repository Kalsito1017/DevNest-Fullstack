import { apiGet } from "./client";

/**
 * GET /api/companies
 * Supports: search, sort, onlyActive, sizeBucket, location
 */
export async function getCompanies({
  search = "",
  sort = "random",
  onlyActive = true,
  sizeBucket = "",
  location = "",
} = {}) {
  const params = new URLSearchParams();

  if (search) params.set("search", search);
  params.set("sort", sort);
  params.set("onlyActive", String(onlyActive));
  if (sizeBucket) params.set("sizeBucket", sizeBucket);
  if (location) params.set("location", location);

  return apiGet(`/companies?${params.toString()}`);
}


/**
 * GET /api/companies/size-stats
 */
export async function getCompanySizeStats({ onlyActive = true } = {}) {
  return apiGet(`/companies/size-stats?onlyActive=${onlyActive}`);
}

/**
 * GET /api/companies/location-stats
 */
export async function getCompanyLocationStats({ onlyActive = true } = {}) {
  return apiGet(`/companies/location-stats?onlyActive=${onlyActive}`);
}

/**
 * GET /api/companies/map
 */
export async function getCompaniesForMap({ onlyActive = true } = {}) {
  return apiGet(`/companies/map?onlyActive=${onlyActive}`);
}

/**
 * GET /api/companies/suggest?q=...&take=8&onlyActive=true
 */
export async function getCompanySuggestions({ q = "", take = 8, onlyActive = true } = {}) {
  const qs = new URLSearchParams();
  const term = (q || "").trim();

  if (term) qs.set("q", term);
  qs.set("take", String(take));
  qs.set("onlyActive", String(onlyActive));

  return apiGet(`/companies/suggest?${qs.toString()}`);

  
}

export async function getCompanyProfileById(id) {
  return apiGet(`/companies/${id}/profile`);
}
