// LocationHome.jsx (new page: Home-style, but scoped to a location)
// Route example: /jobs/location/sofia

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../Home/Home.css";

import sofiaBg from "../../assets/sofia_hero.png";
import plovdivBg from "../../assets/plovdiv_hero.png";
import varnaBg from "../../assets/varna_hero.png";
import burgasBg from "../../assets/burgas_hero.png";
import ruseBg from "../../assets/ruse_hero.png";
import remoteBg from "../../assets/remote_hero.png";

import { getHomeSections } from "../../services/api/home";

const API = "http://localhost:5099/api";

const cityMeta = {
  sofia: { label: "София", bg: sofiaBg },
  plovdiv: { label: "Пловдив", bg: plovdivBg },
  varna: { label: "Варна", bg: varnaBg },
  burgas: { label: "Бургас", bg: burgasBg },
  ruse: { label: "Русе", bg: ruseBg },
  remote: { label: "Remote", bg: remoteBg },
};

function normalizeSlug(raw) {
  const s = decodeURIComponent(String(raw || "")).trim().toLowerCase();
  if (!s) return "sofia";
  if (s.startsWith("location") && s.length > "location".length) {
    return s.replace(/^location/i, "").trim().toLowerCase();
  }
  return s;
}

// slug -> DB city text
function slugToDbCity(slug) {
  switch ((slug || "").toLowerCase()) {
    case "sofia":
      return "Sofia";
    case "varna":
      return "Varna";
    case "plovdiv":
      return "Plovdiv";
    case "burgas":
      return "Burgas";
    case "ruse":
      return "Ruse";
    default:
      return slug;
  }
}

// ✅ IMPORTANT: Remote MUST be location=Remote for your backend
function addCityParams(qs, citySlug) {
  if (citySlug === "remote") {
    qs.set("location", "Remote"); // ✅ REQUIRED
    qs.delete("remote"); // avoid conflicting logic server-side
  } else {
    qs.set("location", slugToDbCity(citySlug));
    qs.delete("remote");
  }
}

export default function LocationHome() {
  const navigate = useNavigate();
  const { city } = useParams();
  const gridRef = useRef(null);

  const citySlug = useMemo(() => normalizeSlug(city), [city]);
  const meta = cityMeta[citySlug] || { label: citySlug, bg: sofiaBg };

  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setIsLoading(true);

        // Sections are still global until backend supports location-aware sections
       const locParam = citySlug === "remote" ? "Remote" : slugToDbCity(citySlug);
const sectionsRaw = await getHomeSections(6, { location: locParam });

        if (!alive) return;
        setSections(Array.isArray(sectionsRaw) ? sectionsRaw : []);

        // ✅ Total jobs count from /jobs/count with location=Remote for Remote
        const qs = new URLSearchParams();
        addCityParams(qs, citySlug);

        const res = await fetch(`${API}/jobs/count?${qs.toString()}`);
        if (!alive) return;

        if (!res.ok) {
          setTotalJobs(0);
          return;
        }

        const data = await res.json();
        if (!alive) return;

        setTotalJobs(Number(data?.totalCount ?? 0) || 0);
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setSections([]);
        setTotalJobs(0);
      } finally {
        if (alive) setIsLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [citySlug]);

  const sorted = useMemo(() => {
    return [...(sections || [])].sort((a, b) => (b.jobsCount || 0) - (a.jobsCount || 0));
  }, [sections]);

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;

    const qs = new URLSearchParams();
    qs.set("q", term);
    qs.set("page", "1");
    qs.set("pageSize", "20");
    addCityParams(qs, citySlug);

    navigate(`/jobs/search?${qs.toString()}`);
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
      <section className="home-hero" style={{ backgroundImage: `url(${meta.bg})` }}>
        <div className="hero-content">
          <h1>
            <span className="hero-title">{totalJobs} </span>
            IT обяви в {meta.label}
          </h1>

          <div style={{ marginTop: 6, fontSize: 18, opacity: 0.95 }}>
            <span className="hero-title">Job Board </span>
            за IT общността
          </div>

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
            <button type="button" className="hero-scroll-dot" onClick={scrollToGrid} aria-label="Scroll to categories">
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
          Общо <b>{totalJobs}</b> обяви в <b>{meta.label}</b>
        </p>

        <div className="dept-grid">
          {sorted.map((s) => {
            const qs = new URLSearchParams();
            qs.set("category", s.categorySlug);
            qs.set("page", "1");
            qs.set("pageSize", "20");
            addCityParams(qs, citySlug);

            const categoryUrl = `/jobs?${qs.toString()}`;

            return (
              <div key={s.categoryId} className="dept-card">
                <div className="dept-head">
                  <div className="dept-title-wrap">
                    <div className="dept-title-row">
                      {s.iconUrl ? (
                        <img className="dept-icon" src={s.iconUrl} alt={s.categoryName} loading="lazy" />
                      ) : null}

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
                      const qsTech = new URLSearchParams();
                      qsTech.set("category", s.categorySlug);
                      qsTech.set("tech", t.techSlug);
                      qsTech.set("page", "1");
                      qsTech.set("pageSize", "20");
                      addCityParams(qsTech, citySlug);

                      const techUrl = `/jobs?${qsTech.toString()}`;

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
                              <img src={t.logoUrl} alt={t.techName} className="dept-tech-icon" loading="lazy" />
                            ) : null}
                            <span className="dept-tech-name">{t.techName}</span>
                          </span>

                          <span className="dept-tech-count">{t.jobsCount}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                <button type="button" className="dept-seeall" onClick={() => navigate(categoryUrl)}>
                  Виж всички →
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ✅ NO NEWSLETTER SECTION */}
    </div>
  );
}
