import { useState } from "react";
import { useAuth } from "../context/AuthContext"; // коригирай path според проекта

const LoginForm = ({ onClose, onSwitchToRegister, onSwitchToForgotPassword }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // засега UI-only
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    setError("");

    try {
   await login({ email, password });


      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.errors) ? err.response.data.errors.join(", ") : null) ||
        "Грешка при влизане. Моля, опитайте отново.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };
    return (
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
                <label htmlFor="login-email">Имейл адрес *</label>
                <input
                    type="email"
                    id="login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="вашият@имейл.com"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                />
            </div>

            <div className="form-group">
                <div className="label-row">
                    <label htmlFor="login-password">Парола *</label>
                    <button
                        type="button"
                        className="forgot-password-btn"
                        onClick={onSwitchToForgotPassword}
                        disabled={isLoading}
                    >
                        Забравена парола?
                    </button>
                </div>
                <div className="password-input-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="login-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Въведете паролата си"
                        required
                        disabled={isLoading}
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        aria-label={showPassword ? 'Скрий парола' : 'Покажи парола'}
                    >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                </div>
            </div>

            <div className="form-options">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isLoading}
                    />
                    <span>Запомни ме</span>
                </label>
            </div>

            {error && (
                <div className="auth-error">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            <button
                type="submit"
                className="auth-btn primary"
                disabled={isLoading || !email || !password}
            >
                {isLoading ? (
                    <>
                        <span className="spinner"></span>
                        Влизане...
                    </>
                ) : 'Влез в профила'}
            </button>

            <div className="auth-divider">
                <span>или</span>
            </div>

            <div className="auth-footer">
                <p>
                    Нямате профил?{' '}
                    <button
                        type="button"
                        className="switch-btn"
                        onClick={onSwitchToRegister}
                        disabled={isLoading}
                    >
                        Създайте профил
                    </button>
                </p>
            </div>
        </form>
    );
};

export default LoginForm;