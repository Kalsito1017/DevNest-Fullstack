import { Link, useNavigate} from "react-router-dom";
import {  useRef, useState } from "react";
import "./Header.css";
import AuthModal from "../../featured/auth/AuthModal";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const navigate = useNavigate();


  // ✅ now we also use authModal + openAuthModal + closeAuthModal from context
  const {
    user,
    isAuthLoading,
    authModal,
    openAuthModal,
    closeAuthModal,
  } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  const locations = ["София", "Варна", "Русе", "Бургас", "Пловдив"];

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setDropdownOpen(false), 200);
  };

  const normalizeSlug = (raw) => {
    const s = decodeURIComponent(String(raw || "")).trim().toLowerCase();
    if (!s) return "";
    if (s.startsWith("location") && s.length > "location".length) {
      return s.replace(/^location/i, "").trim().toLowerCase();
    }
    return s;
  };

  const toSlug = (label) => {
    const v = String(label || "").trim().toLowerCase();
    if (v === "софия") return "sofia";
    if (v === "варна") return "varna";
    if (v === "пловдив") return "plovdiv";
    if (v === "бургас") return "burgas";
    if (v === "русе") return "ruse";
    if (v === "remote") return "remote";
    return normalizeSlug(v);
  };

  const handleLocationClick = (locationLabelOrRemote) => {
    setDropdownOpen(false);
    const slug = toSlug(locationLabelOrRemote);
    navigate(`/jobs/location/${encodeURIComponent(slug)}`);
  };

  // ✅ open modal via context
  const openLogin = () => openAuthModal("login");
  const openRegister = () => openAuthModal("register");

  const displayName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email
    : "";

  const avatarLetter = (
    user?.firstName?.trim()?.[0] ||
    user?.email?.trim()?.[0] ||
    "U"
  ).toUpperCase();

  return (
    <>
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo">
            DevNest
          </Link>

          <nav className="nav">
            <ul className="nav-list">
              <li
                className="nav-item dropdown-container"
                ref={dropdownRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link to="/" className="nav-link dropdown-trigger">
                  Обяви
                </Link>

                {dropdownOpen && (
                  <ul
                    className="dropdown-menu"
                    role="menu"
                    aria-label="Locations"
                  >
                    {locations.map((location) => (
                      <li key={location} className="dropdown-item">
                        <button
                          type="button"
                          className="dropdown-option"
                          onClick={() => handleLocationClick(location)}
                        >
                          IT обяви {location}
                        </button>
                      </li>
                    ))}

                    <li className="dropdown-item dropdown-item-remote">
                      <button
                        type="button"
                        className="dropdown-option"
                        onClick={() => handleLocationClick("Remote")}
                      >
                        Fully Remote IT обяви
                      </button>
                    </li>
                  </ul>
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
            {isAuthLoading ? null : user ? (
              <button
                type="button"
                className="header-avatar"
                onClick={() => navigate("/profile")}
                aria-label="My profile"
                title={displayName}
              >
                {avatarLetter}
              </button>
            ) : (
              <>
                <button type="button" className="btn-login" onClick={openLogin}>
                  Вход
                </button>
                <button
                  type="button"
                  className="btn-register"
                  onClick={openRegister}
                >
                  Регистрация
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ✅ modal driven by AuthContext */}
     {authModal.isOpen && (
  <AuthModal
    key={authModal.mode}
    isOpen={authModal.isOpen}
    onClose={closeAuthModal}
    initialMode={authModal.mode}
  />
)}
    </>
  );
};

export default Header;