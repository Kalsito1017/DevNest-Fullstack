import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import './Header.css';

const Header = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login');

    const dropdownRef = useRef(null);
    const timeoutRef = useRef(null);

    const locations = ['София', 'Варна', 'Русе', 'Бургас', 'Пловдив'];

    const handleMouseEnter = () => {
        clearTimeout(timeoutRef.current);
        setDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setDropdownOpen(false);
        }, 200);
    };

    const handleLocationClick = (location) => {
        setDropdownOpen(false);
        console.log(`Selected location: ${location}`);
    };

    const openLogin = () => {
        setAuthMode('login');
        setShowAuthModal(true);
    };

    const openRegister = () => {
        setAuthMode('register');
        setShowAuthModal(true);
    };

    const closeModal = () => setShowAuthModal(false);

    return (
        <>
            <header className="header">
                <div className="header-container">
                    <Link to="/" className="logo">DevNest</Link>

                    <nav className="nav">
                        <ul className="nav-list">
                            <li
                                className="nav-item dropdown-container"
                                ref={dropdownRef}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                <div className="nav-link dropdown-trigger">
                                   <li className="nav-item">
                                    <Link to="/" className='nav-link'>Обяви</Link>
                                    
                                </li>
                                </div>


                                {dropdownOpen && (
                                    <div className="dropdown-menu">
                                        {locations.map(location => (
                                            <button
                                                key={location}
                                                className="dropdown-option"
                                                onClick={() => handleLocationClick(location)}
                                            >
                                                IT обяви {location}
                                            </button>
                                        ))}

                                        <button
                                            className="dropdown-option"
                                            onClick={() => handleLocationClick('Remote')}
                                        >
                                            Fully Remote IT обяви
                                        </button>
                                    </div>
                                )}
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
                        </ul>
                    </nav>

                    <div className="auth-section">
                        <button className="btn-login" onClick={openLogin}>
                            Вход
                        </button>
                        <button className="btn-register" onClick={openRegister}>
                            Регистрация
                        </button>
                    </div>
                </div>
            </header>

            {showAuthModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{authMode === 'login' ? 'Вход' : 'Регистрация'}</h2>
                        <p>Функционалността ще бъде добавена скоро</p>
                        <button onClick={closeModal}>Затвори</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
