import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Header.css';
import authService from "../../services/authService";
import AuthModal from '../../auth/AuthModal';

const Header = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);

            const cachedUser = authService.getCachedUser();
            if (cachedUser) {
                setUser(cachedUser);
                setIsAuthenticated(true);
            }

            try {
                const response = await authService.checkAuth();
                if (response.authenticated && response.user) {
                    setUser(response.user);
                    setIsAuthenticated(true);
                    authService.cacheUser(response.user);
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
                    authService.clearCachedUser();
                }
            } catch (error) {
                setIsAuthenticated(false);
                setUser(null);
                authService.clearCachedUser();
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const handleLoginClick = () => {
        setAuthMode('login');
        setShowAuthModal(true);
    };

    const handleRegisterClick = () => {
        setAuthMode('register');
        setShowAuthModal(true);
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            setIsAuthenticated(false);
            setUser(null);
            authService.clearCachedUser();
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleAuthSuccess = () => {
        setIsLoading(true);
        setTimeout(async () => {
            try {
                const response = await authService.checkAuth();
                if (response.authenticated && response.user) {
                    setUser(response.user);
                    setIsAuthenticated(true);
                    authService.cacheUser(response.user);
                }
            } catch (error) {
                console.error('Auth check error:', error);
            } finally {
                setIsLoading(false);
            }
        }, 500);
    };

    if (isLoading) {
        return (
            <header className="header">
                <div className="header-container">
                    <Link to="/" className="logo">
                        DevNest
                    </Link>
                    <div className="loading">Зареждане...</div>
                </div>
            </header>
        );
    }

    return (
        <>
            <header className="header">
                <div className="header-container">
                    <Link to="/" className="logo">
                        DevNest
                    </Link>

                    <nav className="nav">
                        <ul className="nav-list">
                            <li className="nav-item">
                                <Link to="/" className="nav-link">
                                    Обяви
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/company" className="nav-link">
                                    Компании
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/blogs" className="nav-link">
                                    Блог
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/aiworkshops" className="nav-link">
                                    AI Workshops
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/aboutus" className="nav-link">
                                    За DevNest
                                </Link>
                            </li>

                            {/* Auth Items - as list items */}
                            {isAuthenticated && user ? (
                                <>
                                    <li className="nav-item auth-item">
                                        <span className="user-greeting">
                                            Здравей, {user.firstName}!
                                        </span>
                                    </li>
                                    <li className="nav-item auth-item">
                                        <Link to="/profile" className="nav-link btn-profile">
                                            Профил
                                        </Link>
                                    </li>
                                    <li className="nav-item auth-item">
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="nav-link btn-logout"
                                        >
                                            Изход
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item auth-item">
                                        <button
                                            type="button"
                                            onClick={handleLoginClick}
                                            className="nav-link btn-login"
                                        >
                                            Вход
                                        </button>
                                    </li>
                                    <li className="nav-item auth-item">
                                        <button
                                            type="button"
                                            onClick={handleRegisterClick}
                                            className="nav-link btn-register"
                                        >
                                            Регистрация
                                        </button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </nav>
                </div>
            </header>

            {/* Auth Modal */}
            {showAuthModal && (
                <AuthModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                    initialMode={authMode}
                    onAuthSuccess={handleAuthSuccess}
                />
            )}
        </>
    );
};

export default Header;