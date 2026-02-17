import { apiPost } from "./client";

const forgotPassword = (email) =>
  apiPost("/contact/email", { email });

const resetPassword = (email, token, newPassword) =>
  apiPost("/auth/reset-password", { email, token, newPassword });

export default { forgotPassword, resetPassword };