import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";
import savedEventsService from "../../../services/api/savedEvents";
import "./WorkshopDetails.css";

const slugify = (text = "") =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export default function WorkshopDetails() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const auth = useAuth();
  const user = auth?.user ?? null;

  const stateId = location.state?.id ?? null;

  const [evt, setEvt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // "idle" | "saving" | "saved" | "unsaved"
  const [ctaState, setCtaState] = useState("idle");
  const [ctaError, setCtaError] = useState("");

  const API_EVENTS = `${API_BASE_URL}/events`;

  const isFinished = useMemo(() => {
    if (!evt?.endDate) return false;
    return new Date(evt.endDate) < new Date();
  }, [evt]);

  const rootClass = `workshop-details ${isFinished ? "workshop-ended" : ""}`;

  // reset CTA when event changes
  useEffect(() => {
    setCtaState("idle");
    setCtaError("");
  }, [evt?.id]);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        setEvt(null);

        // 1) By ID (from state)
        if (stateId) {
          const res = await fetch(`${API_EVENTS}/${stateId}`, {
            signal: controller.signal,
          });
          if (!res.ok)
            throw new Error(`API error ${res.status}: ${await res.text()}`);
          const data = await res.json();

          const canonical = slugify(data?.title || "");
          if (canonical && slug && canonical !== slug) {
            navigate(`/workshop/${canonical}`, {
              replace: true,
              state: { id: data.id },
            });
            return;
          }

          setEvt(data);
          return;
        }

        // 2) Resolve slug -> fetch all
        const resAll = await fetch(API_EVENTS, { signal: controller.signal });
        if (!resAll.ok)
          throw new Error(`API error ${resAll.status}: ${await resAll.text()}`);

        const all = await resAll.json();
        const list = Array.isArray(all) ? all : [];
        const found = list.find((x) => slugify(x.title) === slug);

        if (!found) {
          setLoadError("Не намерихме workshop с този адрес.");
          return;
        }

        // Fetch by id for consistent DTO (speakers etc)
        const resOne = await fetch(`${API_EVENTS}/${found.id}`, {
          signal: controller.signal,
        });
        if (!resOne.ok) {
          setEvt(found); // fallback
          return;
        }

        setEvt(await resOne.json());
      } catch (e) {
        if (e?.name !== "AbortError")
          setLoadError(e?.message || "Failed to load workshop.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [API_EVENTS, slug, stateId, navigate]);

  const requireAuth = () => {
    const eventId = evt?.id;

    navigate("/register", {
      state: {
        // keep it serializable
        background: { pathname: location.pathname, search: location.search },
        intent: { type: "saveWorkshopSeat", eventId },
      },
    });
  };

  const handleReserve = async () => {
    if (!evt?.id) return;
    if (isFinished) return;
    if (ctaState === "saving") return;

    setCtaError("");

    if (!user) {
      requireAuth();
      return;
    }

    setCtaState("saving");

    try {
      const res = await savedEventsService.toggle(evt.id); // { saved: true/false }
      const saved = !!res?.saved;

      setCtaState(saved ? "saved" : "unsaved");
      window.setTimeout(() => setCtaState("idle"), 2000);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) {
        requireAuth();
        return;
      }

      setCtaError(
        e?.response?.data?.message ||
          e?.message ||
          "Не успях да запазя workshop-а.",
      );
      setCtaState("idle");
    }
  };

  if (isLoading) {
    return (
      <div className={rootClass}>
        <div className="workshop-details-container">
          <p className="workshop-status">Loading workshop…</p>
        </div>
      </div>
    );
  }

  if (loadError && !evt) {
    return (
      <div className={rootClass}>
        <div className="workshop-details-container">
          <p className="workshop-status error">{loadError}</p>
          <button
            className="workshop-back-btn"
            type="button"
            onClick={() => navigate(-1)}
          >
            Назад
          </button>
          <button
            className="workshop-back-btn secondary"
            type="button"
            onClick={() => navigate("/aiworkshops")}
          >
            Към AI Workshops
          </button>
        </div>
      </div>
    );
  }

  if (!evt) {
    return (
      <div className={rootClass}>
        <div className="workshop-details-container">
          <p className="workshop-status error">Не намерихме workshop.</p>
          <button
            className="workshop-back-btn"
            type="button"
            onClick={() => navigate("/aiworkshops")}
          >
            Към AI Workshops
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={rootClass}>
      <div className="workshop-details-container">
        <div className="workshop-breadcrumbs">
          <button
            className="workshop-linklike"
            type="button"
            onClick={() => navigate("/aiworkshops")}
          >
            AI Workshops
          </button>
          <span className="workshop-sep">/</span>
          <span className="workshop-current">{evt.title}</span>
        </div>

        <header className={`workshop-hero ${isFinished ? "finished" : ""}`}>
          <div className="workshop-hero-top">
            <h1 className="workshop-title">{evt.title}</h1>
            {isFinished && <span className="workshop-badge">Приключил</span>}
          </div>

          <div className="workshop-meta">
            <div className="workshop-meta-item">
              <span className="workshop-meta-label">Дата</span>
              <span className="workshop-meta-value">
                {evt.eventDate || "—"}
              </span>
            </div>

            {(evt.startDate || evt.endDate) && (
              <div className="workshop-meta-item">
                <span className="workshop-meta-label">Период</span>
                <span className="workshop-meta-value">
                  {evt.startDate
                    ? new Date(evt.startDate).toLocaleDateString("bg-BG")
                    : "—"}
                  {" — "}
                  {evt.endDate
                    ? new Date(evt.endDate).toLocaleDateString("bg-BG")
                    : "—"}
                </span>
              </div>
            )}
          </div>

          {evt.description && (
            <p className="workshop-desc">{evt.description}</p>
          )}

          {!isFinished && (
            <div className="workshop-hero-cta">
              <button
                className={`workshop-primary-btn ${ctaState}`}
                type="button"
                disabled={ctaState === "saving"}
                onClick={handleReserve}
              >
                <span className="cta-label">
                  {ctaState === "idle" && "Запази ми място"}
                  {ctaState === "saving" && "Запазвам…"}
                  {ctaState === "saved" && "Запазено"}
                  {ctaState === "unsaved" && "Премахнато"}
                </span>

                {ctaState === "saving" && (
                  <span className="cta-spinner" aria-hidden="true" />
                )}
                {(ctaState === "saved" || ctaState === "unsaved") && (
                  <span className="cta-check" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>

              <div className="cta-subtext">
                {!user &&
                  ctaState === "idle" &&
                  "За да запазиш място, създай профил или влез."}
                {user &&
                  ctaState === "idle" &&
                  "Безплатна резервация. Потвърждение по-късно."}
                {ctaState === "saving" && "Момент…"}
                {ctaState === "saved" && "Готово! Виж го в „Моите събития“."}
                {ctaState === "unsaved" && "Премахнахме го от „Моите събития“."}
              </div>

              {ctaError && (
                <div
                  className="workshop-status error"
                  style={{ padding: "10px 0 0" }}
                >
                  {ctaError}
                </div>
              )}
            </div>
          )}
        </header>

        {evt.speakers?.length > 0 && (
          <section className="workshop-section">
            <h2 className="workshop-section-title">Лектори</h2>

            <div className="workshop-speakers">
              {evt.speakers.map((sp, idx) => (
                <div className="workshop-speaker" key={`${evt.id}-${idx}`}>
                  <div className="workshop-speaker-avatar">
                    {sp.imageUrl ? (
                      <img
                        src={sp.imageUrl}
                        alt={sp.fullName}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}
                  </div>

                  <div className="workshop-speaker-info">
                    <div className="workshop-speaker-name">{sp.fullName}</div>
                    <div className="workshop-speaker-role">
                      {sp.jobTitle}
                      {sp.company ? ` @ ${sp.company}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="workshop-actions">
          <button
            className="workshop-back-btn"
            type="button"
            onClick={() => navigate(-1)}
          >
            Назад
          </button>
          <button
            className="workshop-back-btn secondary"
            type="button"
            onClick={() => navigate("/aiworkshops")}
          >
            Всички workshops
          </button>
        </div>
      </div>
    </div>
  );
}
