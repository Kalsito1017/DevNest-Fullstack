import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // TODO: смени с твоя asset (пример: import logo from "../../assets/devnest-logo.svg";)
  const logoText = "DevNest.BG";

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Left brand block */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo" aria-label="DevNest Home">
            <span className="footer-logo-mark">{logoText}</span>
          </Link>

          <div className="footer-tagline">Job board за IT обяви</div>
        </div>

        {/* Link columns */}
        <nav className="footer-cols" aria-label="Footer navigation">
          <div className="footer-col">
            <div className="footer-col-title">DevNest.BG</div>
            <ul className="footer-list">
              <li><Link to="/aboutus">За DevNest.BG</Link></li>
              <li><Link to="/contacts">Контакти</Link></li>
              <li><Link to="/employers">За работодатели</Link></li>
              <li><Link to="/terms">Общи Условия</Link></li>
              <li><Link to="/privacy">Уведомление за поверителност</Link></li>
              <li><Link to="/cookies">Политика за използване на бисквитки</Link></li>
            </ul>

            <div className="footer-muted">
              Последно изменение на Общи Условия от 08.05.2024г.
            </div>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">DevNest.BG Events</div>
            <ul className="footer-list">
              <li><Link to="/groups">Потребителски групи</Link></li>
              <li><Link to="/events">ИТ Събития</Link></li>
              <li><Link to="/partners">Партньори</Link></li>
              <li><Link to="/podcast">Подкаст</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">DevNest.BG Jobs</div>
            <ul className="footer-list">
              <li><Link to="/jobs">ИТ Обяви за работа</Link></li>
              <li>
                {/* външен линк */}
                <a
                  href="https://www.jobboardfinder.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Referenced on Jobboardfinder
                </a>
              </li>
            </ul>

            <div className="footer-col-title footer-col-title-spacer">Последвайте ни</div>

            <div className="footer-social">
              <a className="social-btn" href="#" aria-label="Facebook" title="Facebook">
                <FacebookIcon />
              </a>
              <a className="social-btn" href="#" aria-label="LinkedIn" title="LinkedIn">
                <LinkedInIcon />
              </a>
              <a className="social-btn" href="#" aria-label="TikTok" title="TikTok">
                <TikTokIcon />
              </a>
              <a className="social-btn" href="#" aria-label="Instagram" title="Instagram">
                <InstagramIcon />
              </a>
              <a className="social-btn" href="#" aria-label="YouTube" title="YouTube">
                <YouTubeIcon />
              </a>
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <div className="footer-copy">© {currentYear} DevNest. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

/* ---------- Inline SVG icons (no deps) ---------- */

function IconWrap({ children }) {
  return (
    <span className="social-ico" aria-hidden="true">
      {children}
    </span>
  );
}

function FacebookIcon() {
  return (
    <IconWrap>
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5 22v-8h2.7l.4-3H13.5V9.1c0-.9.3-1.6 1.6-1.6H16.7V4.8c-.3 0-1.4-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.6V11H7v3h2.5v8h4z" />
      </svg>
    </IconWrap>
  );
}

function LinkedInIcon() {
  return (
    <IconWrap>
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.5 6.8A1.9 1.9 0 1 1 6.5 3a1.9 1.9 0 0 1 0 3.8ZM4.8 21V8.6h3.4V21H4.8Zm5.6 0V8.6H14v1.7h.1c.5-1 1.8-2.1 3.7-2.1 3.9 0 4.6 2.6 4.6 6V21H19v-5.7c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21h-3.3Z" />
      </svg>
    </IconWrap>
  );
}

function TikTokIcon() {
  return (
    <IconWrap>
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.6 7.2c-1-.7-1.6-1.8-1.7-3h-2.7v11.2a2.3 2.3 0 1 1-2-2.3c.2 0 .5 0 .7.1v-2.7a5 5 0 1 0 3.9 4.9V9.6c1.1.8 2.5 1.2 3.8 1.2V8.2c-.7 0-1.4-.2-2-.6Z" />
      </svg>
    </IconWrap>
  );
}

function InstagramIcon() {
  return (
    <IconWrap>
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm-5 4.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2Zm0 2A1.8 1.8 0 1 0 13.8 12 1.8 1.8 0 0 0 12 10.2ZM17.7 7.6a.9.9 0 1 1-.9-.9.9.9 0 0 1 .9.9Z" />
      </svg>
    </IconWrap>
  );
}

function YouTubeIcon() {
  return (
    <IconWrap>
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3a2.7 2.7 0 0 0-1.9 1.9A28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9A28.6 28.6 0 0 0 22 12a28.6 28.6 0 0 0-.4-4.8ZM10 15.3V8.7L15.5 12 10 15.3Z" />
      </svg>
    </IconWrap>
  );
}
