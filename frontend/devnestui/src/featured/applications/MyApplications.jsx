import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyApplications } from "../../services/api/applications";
import "./MyApplications.css";

export default function MyApplications() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);
      setErr("");

      try {
        const res = await getMyApplications();
        if (!mounted) return;
        setItems(Array.isArray(res) ? res : []);
      } catch (e) {
        if (!mounted) return;
        const msg =
          e?.payload?.message ||
          e?.message ||
          "Не успяхме да заредим кандидатурите.";
        setErr(msg);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return <div className="myapps-wrap">Зареждане…</div>;
  }

  if (err) {
    return <div className="myapps-wrap myapps-error">{err}</div>;
  }

  if (!items.length) {
    return (
      <div className="myapps-wrap myapps-empty">
        Все още нямате подадени кандидатури.
      </div>
    );
  }

  const fmtDate = (v) => {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("bg-BG");
  };

  return (
    <div className="myapps-wrap">
      <div className="myapps-table">
        <div className="myapps-row myapps-head">
          <div>Дата на кандидатстване</div>
          <div>Обява</div>
          <div>Компания</div>
        </div>

        {items.map((x) => (
          <div
            key={x.applicationId ?? `${x.jobId}-${x.appliedAt}`}
            className="myapps-row"
          >
            <div className="myapps-date">{fmtDate(x.appliedAt)}</div>

            <div className="myapps-cell">
              {x.isJobActive ? (
                <button
                  className="myapps-link"
                  type="button"
                  onClick={() => navigate(`/company/jobads/${x.jobId}`)}
                >
                  {x.jobTitle}
                </button>
              ) : (
                <span className="myapps-muted">{x.jobTitle}</span>
              )}
            </div>

            <div className="myapps-cell">
              <button
                className="myapps-link"
                type="button"
                onClick={() => navigate(`/company/${x.companyId}`)}
              >
                {x.companyName}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
