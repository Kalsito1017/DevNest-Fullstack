import { apiGet, apiPostForm } from "./client";

export function applyToJob(formData) {
  return apiPostForm("/applications", formData);
}

export function getMyApplications() {
  return apiGet("/applications/me");
}