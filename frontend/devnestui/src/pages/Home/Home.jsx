import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { getHomeSections } from '../../services/api/home';
import { getCompanies } from '../../services/api/companies';
import heroBg from '../../assets/backgroundimageforhomepagetitle.png';


const Home = () => {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
const [newsletterAccepted, setNewsletterAccepted] = useState(false);
const [newsletterStatus, setNewsletterStatus] = useState('idle');
  const navigate = useNavigate();
  const gridRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);

        const [sectionsRaw] = await Promise.all([
          getHomeSections(6),
          getCompanies({ onlyActive: true }).catch(() => []),
        ]);

        setSections(Array.isArray(sectionsRaw) ? sectionsRaw : []);
        
      } catch (e) {
        console.error(e);
        setSections([]);
        
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);


const handleNewsletterSubmit = (e) => {
  e.preventDefault();

  const email = newsletterEmail.trim();
  if (!email) return;

  // optional: require consent
  // if (!newsletterAccepted) return;

  // later: call API here
  // await subscribeNewsletter({ email })

  setNewsletterStatus('success');
  setNewsletterEmail('');
  setNewsletterAccepted(false);

  window.setTimeout(() => {
    setNewsletterStatus('idle');
  }, 2500);
};



  const totalJobs = useMemo(() => {
    return (sections || []).reduce((sum, s) => sum + (s.jobsCount || 0), 0);
  }, [sections]);

  const sorted = useMemo(() => {
    return [...(sections || [])].sort((a, b) => (b.jobsCount || 0) - (a.jobsCount || 0));
  }, [sections]);

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;

    navigate(`/jobs/search?q=${encodeURIComponent(term)}&page=1&pageSize=20`);
;
  };

  if (isLoading) {
    return (
      <div className="home">
        <div className="home-loading">
          <div className="spinner"></div>
          <p>Зареждане на обяви...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      {/* HERO */}
      <section className="home-hero"
       style={{
    backgroundImage: `url(${heroBg})`
  }}>
        <div className="hero-content">
          <h1>
            <span className="hero-title">Job Board </span>
            за IT общността
          </h1>

          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Търси по ключова дума"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <button type="submit" className="search-button" aria-label="Search">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="search-icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </button>
            </div>
          </form>

          <div className="hero-scroll-holder">
           <button
  type="button"
  className="hero-scroll-dot"
  onClick={scrollToGrid}
  aria-label="Scroll to categories"
>
  <span className="hero-scroll-text">
    Виж<br />обявите<br />подредени
  </span>

  <span className="hero-scroll-arrow" aria-hidden="true">
    ↓
  </span>
</button>

          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories-section" ref={gridRef}>
        <p className="section-subtitle">
          Общо <b>{totalJobs}</b> обяви 
        </p>

        <div className="dept-grid">
          {sorted.map((s) => {
            const categoryUrl = `/jobs?category=${encodeURIComponent(
              s.categorySlug
            )}&page=1&pageSize=20`;

            return (
              <div key={s.categoryId} className="dept-card">
                <div className="dept-head">
                  <div className="dept-title-wrap">
                    <div className="dept-title-row">
                      {s.iconUrl ? (
                        <img
                          className="dept-icon"
                          src={s.iconUrl}
                          alt={s.categoryName}
                          loading="lazy"
                        />
                      ) : null}

                      {/* CATEGORY TITLE AS BUTTON */}
                      <button
                        type="button"
                        className="dept-title-btn"
                        onClick={() => navigate(categoryUrl)}
                        title={`Виж всички ${s.categoryName} обяви`}
                      >
                        {s.categoryName}
                      </button>
                    </div>
                  </div>

                  <span className="dept-count">{s.jobsCount}</span>
                </div>

                {Array.isArray(s.techs) && s.techs.length > 0 ? (
                  <div className="dept-techs">
                    {s.techs.map((t) => {
                      const techUrl = `/jobs?category=${encodeURIComponent(
                        s.categorySlug
                      )}&tech=${encodeURIComponent(t.techSlug)}&page=1&pageSize=20`;

                      return (
                    <button
  key={t.techId}
  type="button"
  className="dept-tech-pill"
  onClick={() => navigate(techUrl)}
  title={`Виж ${t.techName} обяви`}
>
  <span className="dept-tech-left">
    {t.logoUrl ? (
      <img
        src={t.logoUrl}
        alt={t.techName}
        className="dept-tech-icon"
        loading="lazy"
      />
    ) : null}

    <span className="dept-tech-name">{t.techName}</span>
  </span>

  <span className="dept-tech-count">{t.jobsCount}</span>
</button>

                      );
                    })}
                  </div>
                ) : null}

               <button
  type="button"
  className="dept-seeall"
  onClick={() => navigate(categoryUrl)}
>
  Виж всички →
</button>

              </div>
            );
          })}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter-wrap">
        <div className="newsletter-card">
          <div className="newsletter-inner">
            <h2 className="newsletter-title">
              Абонирай се за месечния <br />
              бюлетин на DEVNEST.BG
            </h2>

            <p className="newsletter-subtitle">
              Получавай актуална информация за предстоящи събития и новини от IT сферата
            </p>

           <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
  <input
    className="newsletter-input"
    type="email"
    placeholder="email@domain.com"
    value={newsletterEmail}
    onChange={(e) => setNewsletterEmail(e.target.value)}
    required
  />


{newsletterStatus === 'success' ? (
  <div className="newsletter-success" role="status" aria-live="polite">
    УСПЕШНО АБОНИРАНЕ
  </div>
) : (
  <button className="newsletter-btn" type="submit">
    АБОНИРАЙ МЕ
  </button>
)}
</form>


            <label className="newsletter-consent">
              <input
                type="checkbox"
                checked={newsletterAccepted}
                onChange={(e) => setNewsletterAccepted(e.target.checked)}
              />
              <span>
                Запознат/а съм с{' '}
                <a className="newsletter-link" href="/privacy" target="_blank" rel="noreferrer">
                  Уведомлението за поверителност
                </a>
              </span>
            </label>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
