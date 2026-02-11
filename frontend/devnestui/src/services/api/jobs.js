import { apiGet } from "./client";

/**
 * Normalizes API responses:
 * - if array -> return array
 * - if { items, totalCount } -> return items
 */
function toItems(data) {
  return Array.isArray(data) ? data : data?.items || [];
}

/**
 * SEARCH jobs (listing page)
 * GET /api/jobs/search
 */
export async function searchJobs({
  q,
  category,
  tech,
  location,
  page = 1,
  pageSize = 20,
} = {}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (tech) params.set("tech", tech);
  if (location) params.set("location", location);

  params.set("page", String(page));
  params.set("pageSize", String(pageSize));

  return apiGet(`/jobs/search?${params.toString()}`);
}

/**
 * Fetch ALL jobs using search (used for stats / maps / exports)
 */
export async function fetchAllJobsViaSearch(filters = {}) {
  const pageSize = 500;
  let page = 1;
  let all = [];

  while (true) {
    const data = await searchJobs({ ...filters, page, pageSize });
    const items = toItems(data);

    all = all.concat(items);
    if (items.length < pageSize) break;

    page += 1;
  }

  return all;
}

/**
 * SINGLE job (basic)
 * GET /api/jobs/{id}
 */
export async function getJobById(id) {
  if (!id) throw new Error("getJobById: id is required");
  return apiGet(`/jobs/${id}`);
}

/**
 * LATEST jobs (home page, widgets)
 * GET /api/jobs/latest
 */
export async function getLatestJobs(take = 10) {
  return apiGet(`/jobs/latest?take=${take}`);
}

/* =========================================================
   DEV.BG STYLE JOB AD PAGE
   ========================================================= */

/**
 * Job Ad Details (new dev.bg-like page)
 * GET /api/jobads/{id}
 */
export async function getJobAdById(id) {
  if (!id) throw new Error("getJobAdById: id is required");
  return apiGet(`/jobads/${id}`);
}
