// src/components/auth/ForgotPassword.jsx
import { useState } from 'react';

const ForgotPassword = ({ onClose, onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setIsLoading(true);
        setError('');

        try {
            // TODO: Implement forgot password API call
            // For now, simulate success
            await new Promise(resolve => setTimeout(resolve, 1000));

            setIsSubmitted(true);

        } catch (err) {
            setError('Възникна грешка. Моля, опитайте отново.');
            console.error('Forgot password error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="forgot-password-success">
                <div className="success-icon">📧</div>
                <h3>Проверете имейла си</h3>
                <p>
                    Изпратихме инструкции за възстановяване на паролата на адрес:
                    <br />
                    <strong>{email}</strong>
                </p>
                <p className="note">
                    Ако не виждате имейла, проверете и спам папката.
                </p>
                <div className="success-actions">
                    <button
                        type="button"
                        className="auth-btn primary"
                        onClick={onClose}
                    >
                        Затвори
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
                />
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
                disabled={isLoading || !email}
            >
                {isLoading ? (
                    <>
                        <span className="spinner"></span>
                        Изпращане...
                    </>
                ) : 'Изпрати линк за възстановяване'}
            </button>

            <div className="auth-footer">
                <button
                    type="button"
                    className="back-to-login-btn"
                    onClick={onSwitchToLogin}
                    disabled={isLoading}
                >
                    ← Назад към Вход
                </button>
            </div>
        </form>
    );
};

export default ForgotPassword;