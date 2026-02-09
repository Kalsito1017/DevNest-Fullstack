import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import "./Header.css";
import AuthModal from "../../auth/AuthModal";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const loc = useLocation();
  const { user, isAuthLoading } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  // keep your exact labels
  const locations = ["София", "Варна", "Русе", "Бургас", "Пловдив"];

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setDropdownOpen(false), 200);
  };

  // ✅ robust slug normalize
  const normalizeSlug = (raw) => {
    const s = decodeURIComponent(String(raw || "")).trim().toLowerCase();
    if (!s) return "";
    if (s.startsWith("location") && s.length > "location".length) {
      return s.replace(/^location/i, "").trim().toLowerCase();
    }
    return s;
  };

  // ✅ map BG label -> slug used by LocationHome route
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

  // ✅ derive current selected city slug from URL (no state/localStorage fights)
  const selectedCitySlug = useMemo(() => {
    const parts = (loc.pathname || "").split("/").filter(Boolean);

    // /jobs/location/:city
    if (parts[0] === "jobs" && parts[1] === "location" && parts[2]) {
      return normalizeSlug(parts[2]);
    }

    // fallback: /jobs?location=sofia OR /jobs?remote=true
    const sp = new URLSearchParams(loc.search || "");
    const remote = (sp.get("remote") || "").toLowerCase();
    if (remote === "true" || remote === "1") return "remote";

    const qLoc = sp.get("location");
    if (qLoc) {
      const rawCity = decodeURIComponent(qLoc).split(",")[0].trim().toLowerCase();
      // accept Sofia / sofia etc.
      return toSlug(rawCity);
    }

    return "";
  }, [loc.pathname, loc.search]);

  const handleLocationClick = (locationLabelOrRemote) => {
    setDropdownOpen(false);

    const slug = toSlug(locationLabelOrRemote);

    // ✅ always go to the location home route (matches your LocationHome.jsx)
    navigate(`/jobs/location/${encodeURIComponent(slug)}`);
  };

  const openLogin = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const openRegister = () => {
    setAuthMode("register");
    setShowAuthModal(true);
  };

  const closeModal = () => setShowAuthModal(false);

  const displayName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email
    : "";

  const avatarLetter = (user?.firstName?.trim()?.[0] ||
    user?.email?.trim()?.[0] ||
    "U").toUpperCase();

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
                  <ul className="dropdown-menu" role="menu" aria-label="Locations">
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
                <button className="btn-login" onClick={openLogin}>
                  Вход
                </button>
                <button className="btn-register" onClick={openRegister}>
                  Регистрация
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={closeModal} initialMode={authMode} />
    </>
  );
};

export default Header;
