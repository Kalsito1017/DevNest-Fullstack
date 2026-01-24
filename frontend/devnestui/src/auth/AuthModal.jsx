// src/components/auth/AuthModal.jsx
import { useState } from 'react';
import './AuthModal.css';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPassword from './ForgotPassword';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [currentMode, setCurrentMode] = useState(initialMode);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSwitchMode = (mode) => {
        setCurrentMode(mode);
    };

    const renderContent = () => {
        switch (currentMode) {
            case 'login':
                return (
                    <LoginForm
                        onClose={onClose}
                        onSwitchToRegister={() => handleSwitchMode('register')}
                        onSwitchToForgotPassword={() => handleSwitchMode('forgot')}
                    />
                );
            case 'register':
                return (
                    <RegisterForm
                        onClose={onClose}
                        onSwitchToLogin={() => handleSwitchMode('login')}
                    />
                );
            case 'forgot':
                return (
                    <ForgotPassword
                        onClose={onClose}
                        onSwitchToLogin={() => handleSwitchMode('login')}
                    />
                );
            default:
                return null;
        }
    };

    const getTitle = () => {
        switch (currentMode) {
            case 'login': return 'Вход в профил';
            case 'register': return 'Създай нов профил';
            case 'forgot': return 'Забравена парола';
            default: return '';
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{getTitle()}</h2>
                    <button
                        type="button"
                        className="close-btn"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="modal-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;