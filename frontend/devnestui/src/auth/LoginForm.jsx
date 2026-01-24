// src/components/auth/LoginForm.jsx
import { useState } from 'react';
import authService from '../services/authService';

const LoginForm = ({ onClose, onSwitchToRegister, onSwitchToForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setIsLoading(true);
        setError('');

        try {
            await authService.login(email, password, rememberMe);

            // Success - close modal and reload page to update auth state
            onClose();
            setTimeout(() => {
                window.location.reload();
            }, 100);

        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Грешка при влизане. Моля, опитайте отново.');
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