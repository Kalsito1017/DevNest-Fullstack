// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../auth/RegisterForm';
import './AuthPages.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [isRegistered, setIsRegistered] = useState(false);

    const handleClose = () => {
        navigate('/');
    };

    return (
        <div className="auth-page">
            <div className="auth-page-container">
                <div className="auth-page-card">
                    {isRegistered ? (
                        <div className="registration-success">
                            <h2>Registration Successful!</h2>
                            <p>Your account has been created successfully.</p>
                            <button onClick={() => navigate('/login')}>
                                Go to Login
                            </button>
                        </div>
                    ) : (
                        <RegisterForm
                            onClose={handleClose}
                            onSwitchToLogin={() => navigate('/login')}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;