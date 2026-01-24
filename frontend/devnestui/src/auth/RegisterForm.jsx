// src/components/auth/RegisterForm.jsx
import { useState, useEffect } from 'react';
import authService from '../services/authService';

const RegisterForm = ({ onClose, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successPopup, setSuccessPopup] = useState(false);

    // Simple math question for bot prevention
    const [mathQuestion, setMathQuestion] = useState({ question: '', answer: 0 });
    const [mathAnswer, setMathAnswer] = useState('');

    // Generate math question on mount
    useEffect(() => {
        generateMathQuestion();
    }, []);

    const generateMathQuestion = () => {
        const num1 = Math.floor(Math.random() * 20) + 5;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operations = ['+', '-'];
        const operation = operations[Math.floor(Math.random() * operations.length)];

        let question = '';
        let answer = 0;

        if (operation === '+') {
            question = `${num1} + ${num2}`;
            answer = num1 + num2;
        } else {
            question = `${num1} - ${num2}`;
            answer = num1 - num2;
        }

        setMathQuestion({ question, answer });
        setMathAnswer('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const errors = [];

        if (formData.firstName.length < 2) {
            errors.push('Името трябва да бъде поне 2 символа');
        }

        if (formData.lastName.length < 2) {
            errors.push('Фамилията трябва да бъде поне 2 символа');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            errors.push('Моля, въведете валиден имейл адрес');
        }

        if (formData.password.length < 6) {
            errors.push('Паролата трябва да бъде поне 6 символа');
        }

        if (formData.password !== formData.confirmPassword) {
            errors.push('Паролите не съвпадат');
        }

        if (!agreeTerms) {
            errors.push('Трябва да се съгласите с условията');
        }

        if (parseInt(mathAnswer) !== mathQuestion.answer) {
            errors.push('Грешен отговор на въпроса за сигурност');
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setIsLoading(true);
        setError('');

        // Client-side validation
        const errors = validateForm();
        if (errors.length > 0) {
            setError(errors.join(', '));
            setIsLoading(false);
            return;
        }

        try {
            // Call the auth service
            const response = await authService.register(
                formData.firstName,
                formData.lastName,
                formData.email,
                formData.password
            );

            console.log('Registration successful:', response);

            // Show success popup
            setSuccessPopup(true);

            // Auto-close and redirect after 3 seconds
            setTimeout(() => {
                setSuccessPopup(false);
                onClose();
                window.location.reload();
            }, 3000);

        } catch (err) {
            console.error('Registration error:', err);

            let errorMessage = 'Грешка при регистрация. Моля, опитайте отново.';

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.errors) {
                errorMessage = err.response.data.errors.join(', ');
            }

            setError(errorMessage);

            // Generate new math question on error
            generateMathQuestion();
        } finally {
            setIsLoading(false);
        }
    };

    // Success Popup Component
    const SuccessPopup = () => {
        if (!successPopup) return null;

        return (
            <div className="success-popup-overlay">
                <div className="success-popup">
                    <div className="success-icon">✅</div>
                    <h3>Успешна регистрация!</h3>
                    <p>Вашият профил беше създаден успешно.</p>
                    <p className="success-subtext">Пренасочване към началната страница...</p>
                    <div className="success-progress">
                        <div className="progress-bar"></div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <SuccessPopup />

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="firstName">Име *</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Име"
                            required
                            disabled={isLoading}
                            minLength="2"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastName">Фамилия *</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Фамилия"
                            required
                            disabled={isLoading}
                            minLength="2"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="email">Имейл адрес *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="вашият@имейл.com"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="password">Парола *</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Поне 6 символа"
                                required
                                disabled={isLoading}
                                minLength="6"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Потвърди парола *</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Повтори паролата"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={isLoading}
                            >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Math question for bot prevention */}
                <div className="form-group">
                    <label htmlFor="mathAnswer">Въпрос за сигурност *</label>
                    <div className="math-question">
                        <p>Моля, отговорете: {mathQuestion.question} = ?</p>
                        <div className="math-input-row">
                            <input
                                type="number"
                                id="mathAnswer"
                                value={mathAnswer}
                                onChange={(e) => setMathAnswer(e.target.value)}
                                placeholder="Отговор"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="refresh-math-btn"
                                onClick={generateMathQuestion}
                                disabled={isLoading}
                            >
                                Нов въпрос
                            </button>
                        </div>
                    </div>
                </div>

                <div className="form-options">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            disabled={isLoading}
                            required
                        />
                        <span>
                            Съгласен съм с условията за ползване и поверителност
                        </span>
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
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            Регистриране...
                        </>
                    ) : 'Създай профил'}
                </button>

                <div className="auth-footer">
                    <p>
                        Вече имате профил?{' '}
                        <button
                            type="button"
                            className="switch-btn"
                            onClick={onSwitchToLogin}
                            disabled={isLoading}
                        >
                            Влезте в профила си
                        </button>
                    </p>
                </div>
            </form>
        </>
    );
};

export default RegisterForm;