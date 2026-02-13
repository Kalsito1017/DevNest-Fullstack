import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AIWorkshops.css";
import { API_BASE_URL } from "../../../config/api";

const slugify = (text = "") =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const AIWorkshops = () => {
  const navigate = useNavigate(); // ✅ HOOK тук, най-горе
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = `${API_BASE_URL}/events`;

  useEffect(() => {
    const controller = new AbortController();

    const loadEvents = async () => {
      try {
        setIsLoading(true);
        setError("");

        const res = await fetch(API_URL, { signal: controller.signal });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error ${res.status}: ${text}`);
        }

        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.name !== "AbortError") {
          setError(e.message || "Failed to load events.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
    return () => controller.abort();
  }, [API_URL]);

  return (
    <div className="ai-workshops">
      <div className="ai-workshops-container">
        {/* HERO */}
        <div className="aiw-hero">
          <h1 className="aiw-hero-title">AI Workshops</h1>
          <p className="aiw-hero-text">
            Времето за флирт с AI свърши. Той вече е част от задължителната
            програма. Използваме опита си от над 1500 организирани IT събития, за
            да ви предоставим интензивни и практични AI workshops.
          </p>
        </div>

        {/* STATUS */}
        {isLoading && <p className="ai-workshops-status">Loading events…</p>}
        {!isLoading && error && (
          <p className="ai-workshops-status error">{error}</p>
        )}
        {!isLoading && !error && events.length === 0 && (
          <p className="ai-workshops-status">No events found.</p>
        )}

        {/* EVENTS */}
        {!isLoading && !error && events.length > 0 && (
          <div className="aiw-list">
            {events.map((evt) => {
              const isFinished =
                evt.endDate && new Date(evt.endDate) < new Date();

              return (
                <article className="aiw-card" key={evt.id}>
                  {/* LEFT */}
                  <div
                    className={`aiw-card-left ${
                      isFinished ? "aiw-card-left-finished" : ""
                    }`}
                  >
                    <h3 className="aiw-card-left-title">{evt.title}</h3>

                    {evt.speakers?.length > 0 && (
                      <div className="aiw-speakers-row">
                        {evt.speakers.map((sp, idx) => (
                          <div
                            className="aiw-speaker-chip"
                            key={`${evt.id}-${idx}`}
                          >
                            <div className="aiw-speaker-avatar-wrapper">
                              <img
                                className={`aiw-speaker-avatar ${
                                  isFinished
                                    ? "aiw-speaker-avatar-finished"
                                    : ""
                                }`}
                                src={sp.imageUrl}
                                alt={sp.fullName}
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />

                              {isFinished && (
                                <span className="aiw-badge-finished">
                                  Приключил
                                </span>
                              )}
                            </div>

                            <div className="aiw-speaker-text">
                              <div className="aiw-speaker-name">
                                {sp.fullName}
                              </div>
                              <div className="aiw-speaker-role">
                                {sp.jobTitle}
                                {sp.company ? ` @ ${sp.company}` : ""}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* RIGHT */}
                  <div className="aiw-card-right">
                    {evt.description && (
                      <p className="aiw-desc">{evt.description}</p>
                    )}

                    <div className="aiw-bottom">
                      <div className="aiw-date">
                        <div className="aiw-date-top">
                          <span className="aiw-date-icon" aria-hidden="true">
                            📅
                          </span>
                          <span className="aiw-date-label">Дата</span>
                        </div>

                        <div className="aiw-date-value">
                          {evt.eventDate || "—"}
                        </div>
                      </div>

                      <button
                        className="aiw-btn"
                        type="button"
                        onClick={() =>
                          navigate(`/workshop/${slugify(evt.title)}`, {
                            state: { id: evt.id },
                          })
                        }
                      >
                        Виж повече
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIWorkshops;
