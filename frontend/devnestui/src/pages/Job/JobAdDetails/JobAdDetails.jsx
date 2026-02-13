import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./JobAdDetails.css";
import { getJobAdById } from "../../../services/api/jobs";
import JobMapModal from "../JobMapModal/JobMapModal";
import mapBg from "../../../assets/backgroundmapimage.jpg";
import applyIcon from "../../../assets/vecteezy_simple-icon-of-a-paper-airplane-for-delivery_4879664.svg";
import { useAuth } from "../../../context/AuthContext";
import { useSavedJobs } from "../../../context/SavedJobsContext";

function formatRelativeBg(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 60) return `Публикувана преди ${mins} минути`;
  if (hours < 24) return `Публикувана преди ${hours} часа`;
  return `Публикувана преди ${days} дни`;
}

function safeText(v) {
  return typeof v === "string" ? v : "";
}

export default function JobAdDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { isSaved, toggleSaved } = useSavedJobs();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [err, setErr] = useState("");
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);
      setErr("");

      const idNum = Number(jobId);
      if (!idNum) {
        setErr("Невалиден Job ID.");
        setIsLoading(false);
        return;
      }

      try {
        const res = await getJobAdById(idNum);
        if (!mounted) return;
        setData(res);
      } catch {
        if (!mounted) return;
        setErr("Не успях да заредя обявата.");
        setData(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [jobId]);

  const company = data?.company;

  const publishedText = useMemo(() => {
    if (!data?.createdAt) return "";
    return formatRelativeBg(data.createdAt);
  }, [data?.createdAt]);

  if (isLoading) {
    return (
      <div className="jad-page">
        <div className="jad-container">
          <div className="jad-loading">
            <div className="jad-spinner" />
            <div className="jad-loading-text">Зареждане…</div>
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="jad-page">
        <div className="jad-container">
          <div className="jad-error">
            <div className="jad-error-title">{err}</div>
            <button type="button" className="jad-btn jad-btn-ghost" onClick={() => navigate(-1)}>
              Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const saved = isSaved(data.id);

  return (
    <div className="jad-page">
      <div className="jad-container">
        {/* TOP CARD */}
        <div className="jad-top">
          <div className="jad-top-left">
            <div className="jad-company-chip">
              <div className="jad-company-logo">
                {company?.logoUrl ? (
                  <img src={company.logoUrl} alt={company?.name || "Company"} />
                ) : (
                  <div className="jad-logo-fallback" />
                )}
              </div>
              <div className="jad-company-name">{company?.name || "Компания"}</div>
            </div>

            <div className="jad-title">{data.title}</div>

            <div className="jad-meta">
              <div className="jad-meta-item">
                <span className="jad-pin" />
                <span>{data.isRemote ? "Remote" : safeText(data.location)}</span>
              </div>
            </div>
          </div>

          <div className="jad-top-right">
            <button
              type="button"
              className="jad-btn jad-btn-primary jad-btn-apply"
              onClick={() => alert("Кандидатствай (ще го вържем по-късно)")}
            >
              <img src={applyIcon} alt="" className="jad-btn-icon" />
              Кандидатствай
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="jad-grid">
          <div className="jad-main">
            {/* Categories + Map */}
            <div className={`jad-row ${data.isRemote ? "jad-row-single" : ""}`}>
              <div className="jad-box">
                <div className="jad-box-title">Обявата е публикувана в следните категории</div>

                <div className="jad-pills">
                  {(data.categories || []).map((c) => (
                    <button
                      key={c.id || c.name}
                      type="button"
                      className="jad-pill"
                      onClick={() => (c.slug ? navigate(`/jobs?category=${encodeURIComponent(c.slug)}`) : navigate(`/jobs`))}
                      title={c.name}
                    >
                      <span className="jad-pill-name">{c.name}</span>
                      {typeof c.count === "number" && <span className="jad-pill-count">{c.count}</span>}
                    </button>
                  ))}

                  {(!data.categories || data.categories.length === 0) && (
                    <div className="jad-pill jad-pill-muted">Без категория</div>
                  )}
                </div>
              </div>

              {/* Map box only if NOT remote */}
              {!data.isRemote ? (
                <div className="jad-box jad-mapbox jad-mapbox-leaflet" style={{ backgroundImage: `url(${mapBg})` }}>
                  <button type="button" className="jad-map-open" onClick={() => setMapOpen(true)}>
                    Виж обявата на картата
                  </button>
                </div>
              ) : null}
            </div>

            {/* Modal */}
            <JobMapModal
              open={mapOpen}
              onClose={() => setMapOpen(false)}
              locationText={data.location}
              title={data.title}
              companyName={company?.name}
            />

            {/* Published + actions */}
            <div className="jad-submeta">
              <div className="jad-submeta-left">
                <span className="jad-calendar" />
                <span>{publishedText}</span>
              </div>

              <div className="jad-submeta-right">
                {/* ✅ same idea as Jobs list: icon changes + pressed state */}
                {user ? (
                  <button
                    type="button"
                    className={`jad-save ${saved ? "is-saved" : ""}`}
                    title={saved ? "Премахни от запазени" : "Запази обявата"}
                    aria-label={saved ? "Премахни от запазени" : "Запази обявата"}
                    aria-pressed={saved}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSaved(data.id);
                    }}
                  >
                    {saved ? "📌" : "📍"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="jad-save"
                    onClick={() => navigate("/login")}
                    title="Влез, за да запазваш обяви"
                  >
                    📍
                  </button>
                )}

                <button type="button" className="jad-action" onClick={() => alert("Report (по-късно)")}>
                  Съобщи проблем
                </button>
              </div>
            </div>

            {/* Tech stack */}
            <div className="jad-section">
              <div className="jad-section-title">Tech stack / изисквания</div>

              <div className="jad-tech-icons">
                {(data.techStack || []).map((t, idx) => (
                  <div key={`${t.name || "tech"}-${idx}`} className="jad-tech" title={t.name}>
                    {t.logoUrl ? (
                      <img src={t.logoUrl} alt={t.name} />
                    ) : (
                      <div className="jad-tech-fallback">{(t.name || "").slice(0, 2).toUpperCase()}</div>
                    )}
                  </div>
                ))}

                {(!data.techStack || data.techStack.length === 0) && <div className="jad-tech-empty">Няма добавени технологии.</div>}
              </div>
            </div>

            {/* Company about */}
            <div className="jad-section">
              <div className="jad-section-title">About {company?.name || "company"}</div>
              <div className="jad-text">{safeText(data.companyAbout) || "Няма добавено описание за компанията."}</div>
            </div>

            {/* Job description */}
            <div className="jad-section">
              <div className="jad-section-title">About the role</div>
              <div className="jad-text">{safeText(data.description) || "Няма добавено описание за позицията."}</div>

              <div className="jad-apply-bottom">
                <button
                  type="button"
                  className="jad-btn jad-btn-primary jad-btn-apply"
                  onClick={() => alert("Кандидатствай (ще го вържем по-късно)")}
                >
                  <img src={applyIcon} alt="" className="jad-btn-icon" />
                  Кандидатствай
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="jad-aside">
            <div className="jad-aside-card">
              <div className="jad-aside-top">
                <div className="jad-aside-logo">
                  {company?.logoUrl ? (
                    <img src={company.logoUrl} alt={company?.name || "Company"} />
                  ) : (
                    <div className="jad-logo-fallback" />
                  )}
                </div>
                <div className="jad-aside-name">{company?.name || "Компания"}</div>
              </div>

              <div className="jad-aside-label">За компанията</div>
              <div className="jad-aside-text">{safeText(data.companyAbout)?.slice(0, 420) || "Няма кратко описание."}</div>

              <button
                type="button"
                className="jad-btn jad-btn-soft"
                onClick={() => (company?.id ? navigate(`/company/${company.id}`) : navigate("/company"))}
              >
                Повече за компанията
              </button>

             <button
  type="button"
  className="jad-btn jad-btn-soft"
  onClick={() => {
    if (!company?.id) return navigate("/company");

    // ✅ reliable hash navigation (react-router v6)
    navigate({
      pathname: `/company/${company.id}`,
      hash: "#jobs",
    });
  }}
>
  Всички обяви на компанията
</button>

            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
