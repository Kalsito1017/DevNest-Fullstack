import { apiPost } from "./client"; // or wherever your apiPost lives

export const subscribeNewsletter = (email, opts) => {
  return apiPost("/newsletter/subscribe", { email }, opts);
};
