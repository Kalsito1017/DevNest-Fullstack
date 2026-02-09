import { apiGet } from "./client";

export async function getHomeSections(takeTechs = 6, { location = "" } = {}) {
  const qs = new URLSearchParams();
  qs.set("takeTechs", String(takeTechs));
  if (location) qs.set("location", location); // "Sofia" | "Varna" | "Remote" ...
  return apiGet(`/home?${qs.toString()}`);
}
