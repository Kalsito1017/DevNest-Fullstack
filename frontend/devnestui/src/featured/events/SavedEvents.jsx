import { useEffect, useMemo, useState } from "react";
import savedEventsService from "../../services/api/savedEvents";
import "./SavedEvents.css";

const slugify = (text = "") =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export default function SavedEvents({ onRequireAuth, onOpenWorkshop }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setIsLoading(true);
    try {
      const data = await savedEventsService.mine();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) {
        onRequireAuth?.();
        return;
      }
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Не успях да заредя запазените workshops.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRemove = async (eventId) => {
    setError("");
    setBusyId(eventId);
    try {
      const res = await savedEventsService.toggle(eventId); // { saved }
      const saved = !!res?.saved;

      // In saved list: if now unsaved => remove from UI
      if (!saved) {
        setItems((prev) => prev.filter((x) => x.id !== eventId));
      } else {
        // edge: if it became saved again, reload order
        await load();
      }
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) {
        onRequireAuth?.();
        return;
      }
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Не успях да премахна workshop-а.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const title = useMemo(
    () => `Запазени AI Workshops (${items.length})`,
    [items.length],
  );

  if (isLoading) {
    return <div className="saved-events-state">Зареждане…</div>;
  }

  return (
    <div className="saved-events">
      <div className="saved-events-head">
        <h2 className="saved-events-title">{title}</h2>
        <button className="saved-events-refresh" type="button" onClick={load}>
          Обнови
        </button>
      </div>

      {error && <div className="saved-events-flash error">{error}</div>}

      {items.length === 0 ? (
        <div className="saved-events-state">Нямаш запазени workshops.</div>
      ) : (
        <div className="saved-events-list">
          {items.map((evt) => {
            const isFinished =
              evt.endDate && new Date(evt.endDate) < new Date();
            const slug = slugify(evt.title);

            return (
              <article
                key={evt.id}
                className={`saved-events-card ${isFinished ? "is-finished" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => onOpenWorkshop?.(evt.id, slug)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    onOpenWorkshop?.(evt.id, slug);
                }}
              >
                <div className="saved-events-main">
                  <div className="saved-events-title-row">
                    <div className="saved-events-card-title">{evt.title}</div>
                    {isFinished && (
                      <span className="saved-events-badge">Приключил</span>
                    )}
                  </div>

                  <div className="saved-events-meta">
                    <span className="k">Дата:</span>
                    <span className="v">{evt.eventDate || "—"}</span>
                  </div>

                  {evt.description ? (
                    <div className="saved-events-desc">{evt.description}</div>
                  ) : null}
                </div>

                <button
                  className="saved-events-remove"
                  type="button"
                  disabled={busyId === evt.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemove(evt.id);
                  }}
                  title="Премахни"
                >
                  {busyId === evt.id ? "..." : "Премахни"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
