import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { savedJobsService } from "../services/api/savedJobsService"; // коригирай path ако е различен

export default function SavedJobs() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setIsLoading(true);
    try {
      const data = await savedJobsService.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Не успях да заредя запазените обяви.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeSaved = async (jobId) => {
    // optimistic UI
    const prev = items;
    setItems((x) => x.filter((j) => j.id !== jobId));

    try {
      await savedJobsService.toggle(jobId); // backend toggle -> remove
    } catch (e) {
      // rollback on fail
      setItems(prev);
      setError(e?.response?.data?.message || "Не успях да премахна обявата.");
    }
  };

  if (isLoading) return <div className="profile-empty">Зареждане…</div>;
  if (error) return <div className="profile-empty">{error}</div>;
  if (items.length === 0) return <div className="profile-empty">Нямаш запазени обяви.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {items.map((j) => (
        <div
          key={j.id}
          className="profile-card saved-job-card"
          role="button"
          tabIndex={0}
          onClick={() => navigate(`/company/jobads/${j.id}`)} // ⚠️ ако твоят route е друг - смени тук
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate(`/company/jobads/${j.id}`);
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {j.companyLogoUrl ? (
              <img
                src={j.companyLogoUrl}
                alt={j.companyName}
                style={{
                  width: 56,
                  height: 56,
                  objectFit: "contain",
                  borderRadius: 10,
                  background: "#fff",
                }}
              />
            ) : null}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 18, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {j.title}
              </div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>
                {j.companyName} • {j.isRemote ? "Remote" : j.location || "—"} • {j.jobType} • {j.experienceLevel}
              </div>
            </div>

            <button
              type="button"
              className="saved-remove-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation(); // ✅ да не навигира
                removeSaved(j.id);
              }}
              title="Премахни от запазени"
              aria-label="Премахни от запазени"
            >
              Премахни
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
