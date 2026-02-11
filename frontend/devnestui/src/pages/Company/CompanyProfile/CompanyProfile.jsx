import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CompanyProfile.css";
import { getCompanyProfileById } from "../../../services/api/companies";

const SECTIONS = [
  { id: "about", label: "За Компанията" },
  { id: "tech", label: "Технологии" },
  { id: "work", label: "Начин на работа" },
  { id: "gallery", label: "Галерия" },
  { id: "team", label: "Екипът" },
  { id: "blog", label: "Блог" },
  { id: "video", label: "Видео" },
  { id: "reviews", label: "Другите за нас" },
  { id: "benefits", label: "Придобивки" },
  { id: "additional", label: "Допълнителна информация" },
  { id: "contacts", label: "Контакти" },
  { id: "jobs", label: "Обяви" },
];

const splitTechStack = (s) =>
  String(s || "")
    .split(/[,\n|]/g)
    .map((x) => x.trim())
    .filter(Boolean);

export default function CompanyProfile() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [active, setActive] = useState("about");

  // FIX 2: lock active while smooth scroll is running (click/hash)
  const [lockActive, setLockActive] = useState(false);
  const lockTimerRef = useRef(null);

  const sectionRefs = useRef({});
  const setSectionRef = useCallback(
    (id) => (el) => {
      if (el) sectionRefs.current[id] = el;
    },
    []
  );

  const unlockLater = useCallback((ms = 700) => {
    if (lockTimerRef.current) window.clearTimeout(lockTimerRef.current);
    lockTimerRef.current = window.setTimeout(() => setLockActive(false), ms);
  }, []);

  // ---------- Load ----------
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setErr("");

      const idNum = Number(companyId);
      if (!idNum) {
        setErr("Невалиден Company ID.");
        setLoading(false);
        return;
      }

      try {
        const dto = await getCompanyProfileById(idNum);
        if (!mounted) return;
        setData(dto);
      } catch {
        if (!mounted) return;
        setErr("Не успях да заредя компанията.");
        setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [companyId]);

  // ---------- FIX 1: Stable ScrollSpy (no IntersectionObserver) ----------
  useEffect(() => {
    if (!data) return;

    const offsetTop = 110; // трябва да match-ва scroll-margin-top в CSS (при теб е 110)
    const ids = SECTIONS.map((s) => s.id);

    const computeActive = () => {
      if (lockActive) return;

      // избираме "последната секция", чийто top е минал над offset-а
      let bestId = ids[0];

      for (const id of ids) {
        const el = sectionRefs.current[id];
        if (!el) continue;

        const top = el.getBoundingClientRect().top;
        if (top <= offsetTop + 1) bestId = id;
      }

      if (bestId && bestId !== active) setActive(bestId);
    };

    // initial compute
    computeActive();

    const onScroll = () => computeActive();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, lockActive, active]);

  const scrollToSection = useCallback(
    (id) => {
      const el = sectionRefs.current[id];
      if (!el) return;

      setLockActive(true);
      setActive(id);

      // update hash (без jump)
      window.history.replaceState(null, "", `#${id}`);

      // smooth scroll
      el.scrollIntoView({ behavior: "smooth", block: "start" });

      unlockLater(800);
    },
    [unlockLater]
  );

  // ---------- Hash on open (/company/:id#jobs) ----------
  useEffect(() => {
    if (!data) return;

    const hash = (window.location.hash || "").replace("#", "");
    if (!hash) return;

    const allowed = new Set(SECTIONS.map((s) => s.id));
    if (!allowed.has(hash)) return;

    setLockActive(true);
    setActive(hash);

    // чакаме DOM/layout да се “уталожи”
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        const el = sectionRefs.current[hash];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        unlockLater(900);
      });
      return () => cancelAnimationFrame(raf2);
    });

    return () => cancelAnimationFrame(raf1);
  }, [data, unlockLater]);

  const techPills = useMemo(() => splitTechStack(data?.techStack), [data?.techStack]);

  // ---------- UI states AFTER all hooks ----------
  if (loading) {
    return (
      <div className="cp-page">
        <div className="cp-container">
          <div className="cp-loading">
            <div className="cp-spinner" />
            <div>Зареждане…</div>
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="cp-page">
        <div className="cp-container">
          <div className="cp-error">
            <div className="cp-error-title">{err}</div>
            <button className="cp-btn cp-btn-ghost" onClick={() => navigate(-1)}>
              Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="cp-page">
      <div className="cp-container">
        <div className="cp-top">
          <div className="cp-brand">
            <div className="cp-logo">
              {data.logoUrl ? <img src={data.logoUrl} alt={data.name} /> : <div className="cp-logo-fallback" />}
            </div>
            <div className="cp-name">{data.name}</div>
          </div>

          <button className="cp-btn cp-btn-soft" onClick={() => alert("Subscribe (по-късно)")}>
            Абонирай се
          </button>
        </div>

        <div className="cp-layout">
          <aside className="cp-nav">
            <div className="cp-nav-card">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`cp-nav-item ${active === s.id ? "active" : ""}`}
                  onClick={() => scrollToSection(s.id)}
                >
                  <span className="cp-nav-text">{s.label}</span>
                  {s.id === "jobs" && typeof data.jobsCount === "number" ? (
                    <span className="cp-badge">{data.jobsCount}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </aside>

          <main className="cp-main">
            <section className="cp-banner">
              <div className="cp-cover-fallback">
                <div className="cp-cover-title">{data.name}</div>
              </div>
            </section>

            <section className="cp-cta">
              <button className="cp-btn cp-btn-primary" onClick={() => scrollToSection("jobs")}>
                Виж IT обявите от {data.name}
                {typeof data.jobsCount === "number" ? <span className="cp-btn-count">{data.jobsCount}</span> : null}
              </button>
            </section>

            <section id="about" ref={setSectionRef("about")} className="cp-section">
              <h2 className="cp-h2">За компанията</h2>
              <div className="cp-text">{data.description || "—"}</div>
            </section>

            <section id="tech" ref={setSectionRef("tech")} className="cp-section">
              <h2 className="cp-h2">Технологии</h2>
              <div className="cp-chips">
                {techPills.length ? techPills.map((t) => <span key={t} className="cp-chip">{t}</span>) : <div className="cp-muted">—</div>}
              </div>
            </section>

            <section id="work" ref={setSectionRef("work")} className="cp-section">
              <h2 className="cp-h2">Начин на работа</h2>
              <div className="cp-text">{data.location || "—"}</div>
            </section>

            <section id="gallery" ref={setSectionRef("gallery")} className="cp-section">
              <h2 className="cp-h2">Галерия</h2>
              <div className="cp-muted">Ще добавим (по-късно).</div>
            </section>

            <section id="team" ref={setSectionRef("team")} className="cp-section">
              <h2 className="cp-h2">Екипът</h2>
              <div className="cp-muted">Ще добавим (по-късно).</div>
            </section>

            <section id="blog" ref={setSectionRef("blog")} className="cp-section">
              <h2 className="cp-h2">Блог</h2>
              <div className="cp-muted">Ще добавим (по-късно).</div>
            </section>

            <section id="video" ref={setSectionRef("video")} className="cp-section">
              <h2 className="cp-h2">Видео</h2>
              <div className="cp-muted">Ще добавим (по-късно).</div>
            </section>

            <section id="reviews" ref={setSectionRef("reviews")} className="cp-section">
              <h2 className="cp-h2">Другите за нас</h2>
              <div className="cp-muted">Ще добавим (по-късно).</div>
            </section>

            <section id="benefits" ref={setSectionRef("benefits")} className="cp-section">
              <h2 className="cp-h2">Придобивки</h2>
              <div className="cp-muted">Ще добавим (по-късно).</div>
            </section>

            <section id="additional" ref={setSectionRef("additional")} className="cp-section">
              <h2 className="cp-h2">Допълнителна информация</h2>
              <div className="cp-muted">Ще добавим (по-късно).</div>
            </section>

            <section id="contacts" ref={setSectionRef("contacts")} className="cp-section">
              <h2 className="cp-h2">Контакти</h2>

              <div className="cp-kv">
                <div className="cp-kv-row">
                  <div className="cp-kv-k">Website</div>
                  <div className="cp-kv-v">
                    {data.website ? (
                      <a href={data.website} target="_blank" rel="noreferrer">
                        {data.website}
                      </a>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>

                <div className="cp-kv-row">
                  <div className="cp-kv-k">Email</div>
                  <div className="cp-kv-v">{data.email || "—"}</div>
                </div>

                <div className="cp-kv-row">
                  <div className="cp-kv-k">Phone</div>
                  <div className="cp-kv-v">{data.phone || "—"}</div>
                </div>

                <div className="cp-kv-row">
                  <div className="cp-kv-k">Location</div>
                  <div className="cp-kv-v">{data.location || "—"}</div>
                </div>

                <div className="cp-kv-row">
                  <div className="cp-kv-k">Social</div>
                  <div className="cp-kv-v">
                    {data.linkedInUrl ? (
                      <a href={data.linkedInUrl} target="_blank" rel="noreferrer">
                        LinkedIn
                      </a>
                    ) : null}
                    {data.twitterUrl ? <span> · </span> : null}
                    {data.twitterUrl ? (
                      <a href={data.twitterUrl} target="_blank" rel="noreferrer">
                        Twitter
                      </a>
                    ) : null}
                    {data.gitHubUrl ? <span> · </span> : null}
                    {data.gitHubUrl ? (
                      <a href={data.gitHubUrl} target="_blank" rel="noreferrer">
                        GitHub
                      </a>
                    ) : null}
                    {!data.linkedInUrl && !data.twitterUrl && !data.gitHubUrl ? "—" : null}
                  </div>
                </div>
              </div>
            </section>

            <section id="jobs" ref={setSectionRef("jobs")} className="cp-section">
              <h2 className="cp-h2">Обяви</h2>

              <div className="cp-jobs">
                {(data.jobs || []).length ? (
                  data.jobs.map((j) => (
                    <button
                      key={j.id}
                      className="cp-jobrow"
                      onClick={() => navigate(`/company/jobads/${j.id}`)}
                      type="button"
                    >
                      <div className="cp-jobtitle">{j.title}</div>
                      <div className="cp-jobmeta">
                        <span>{j.isRemote ? "Remote" : j.location || "—"}</span>
                        <span>{new Date(j.createdAt).toLocaleDateString("bg-BG")}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="cp-muted">Няма активни обяви.</div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
