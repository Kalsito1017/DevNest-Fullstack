// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../auth/LoginForm';
import './AuthPages.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLogin, setIsLogin] = useState(true);

    const handleClose = () => {
        // Redirect back to where they came from, or home
        const from = location.state?.from?.pathname || '/';
        navigate(from);
    };

    return (
        <div className="auth-page">
            <div className="auth-page-container">
                <div className="auth-page-card">
                    {isLogin ? (
                        <LoginForm
                            onClose={handleClose}
                            onSwitchToRegister={() => setIsLogin(false)}
                        />
                    ) : (
                        <RegisterForm
                            onClose={handleClose}
                            onSwitchToLogin={() => setIsLogin(true)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;