// src/components/auth/ForgotPassword.jsx
import { useState } from "react";
import passwordReset from "../../../services/api/passwordReset"; // adjust path to your project

const ForgotPassword = ({ onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const trimmed = email.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError("");

    try {
      // axios wrapper already uses your config baseURL
      await passwordReset.forgotPassword(trimmed);

      // Even if email doesn't exist, API should return 200 (anti-enumeration)
      setIsSubmitted(true);
    } catch (err) {
      // axios error shape: err.response?.data?.message / err.response?.data?.errors
      const data = err?.response?.data;
      const message =
        data?.message ||
        (Array.isArray(data?.errors) ? data.errors.join(", ") : "") ||
        err?.message ||
        "Възникна грешка. Моля, опитайте отново.";

      setError(message);
      console.error("Forgot password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="forgot-password-success" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon">📧</div>
        <h3>Проверете имейла си</h3>
        <p>
          Ако съществува профил с този имейл, изпратихме инструкции за възстановяване на паролата на:
          <br />
          <strong>{email}</strong>
        </p>
        <p className="note">Ако не виждате имейла, проверете и спам папката.</p>

        <div className="success-actions">
          <button type="button" className="auth-btn primary" onClick={onClose}>
            Затвори
          </button>
        </div>

        <div className="auth-footer" style={{ marginTop: 12 }}>
          <button type="button" className="back-to-login-btn" onClick={onSwitchToLogin}>
            ← Назад към Вход
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form" noValidate onClick={(e) => e.stopPropagation()}>
      <div className="forgot-instructions">
        <p>Въведете имейл адреса, свързан с вашия профил и ще ви изпратим линк за възстановяване на паролата.</p>
      </div>

      <div className="form-group">
        <label htmlFor="forgot-email">Имейл адрес *</label>
        <input
          type="email"
          id="forgot-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="вашият@имейл.com"
          required
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      {error && (
        <div className="auth-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <button type="submit" className="auth-btn primary" disabled={isLoading || !email.trim()}>
        {isLoading ? (
          <>
            <span className="spinner"></span>
            Изпращане...
          </>
        ) : (
          "Изпрати линк за възстановяване"
        )}
      </button>

      <div className="auth-footer">
        <button type="button" className="back-to-login-btn" onClick={onSwitchToLogin} disabled={isLoading}>
          ← Назад към Вход
        </button>
      </div>
    </form>
  );
};

export default ForgotPassword;