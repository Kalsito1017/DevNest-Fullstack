import { apiGet } from "./client";

function toItems(data) {
  return Array.isArray(data) ? data : data?.items || [];
}

export async function searchJobs({ q, category, tech, location, page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (tech) params.set("tech", tech);
  if (location) params.set("location", location);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  return apiGet(`/jobs/search?${params.toString()}`);
}

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

export async function getJobById(id) {
  return apiGet(`/jobs/${id}`);
}

export async function getLatestJobs(take = 10) {
  return apiGet(`/jobs/latest?take=${take}`);
}
