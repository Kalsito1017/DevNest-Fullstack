import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./JobSearch.css";

import hybridIcon from "../../../assets/hybrid.png";
import homeOfficeIcon from "../../../assets/homeoffice.png";

const API = "http://localhost:5099/api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const iconifyColorize = (url) => {
  if (!url || typeof url !== "string") return url;
  if (url.includes("api.iconify.design") && !url.includes("color=")) {
    const join = url.includes("?") ? "&" : "?";
    return `${url}${join}color=%232f52ff`;
  }
  return url;
};

const cityOnly = (loc) => (loc ? String(loc).split(",")[0].trim() : "");

export default function JobSearch() {
  const q = useQuery();
  const navigate = useNavigate();

  const query = (q.get("q") || "").trim();
  const page = Math.max(1, Number(q.get("page") || 1));
  const pageSize = Math.min(50, Math.max(5, Number(q.get("pageSize") || 20)));

  const [input, setInput] = useState(query);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const depsKey = useMemo(() => q.toString(), [q]);

  const setParam = (key, value, { resetPage = true, scrollTop = false } = {}) => {
    const next = new URLSearchParams(q);

    if (value === "" || value == null) next.delete(key);
    else next.set(key, String(value));

    if (resetPage) next.set("page", "1");

    navigate(`/jobs/search?${next.toString()}`);
    if (scrollTop) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = (e) => {
    e.preventDefault();
    const term = input.trim();
    if (!term) return;
    setParam("q", term, { resetPage: true, scrollTop: true });
  };

  useEffect(() => {
    setInput(query);
  }, [query]);

  useEffect(() => {
    const load = async () => {
      // ако няма q -> показваме празно състояние
      if (!query) {
        setResult({ items: [], totalItems: 0, totalPages: 0, page, pageSize });
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("q", query);
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));
        params.set("sort", "newest");

        const res = await fetch(`${API}/jobs/search?${params.toString()}`);
        const data = res.ok ? await res.json() : null;

        setResult(data);
      } catch (err) {
        console.error(err);
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page, pageSize, depsKey]);

  const totalItems = result?.totalItems ?? 0;
  const totalPages = result?.totalPages ?? 0;
  const items = Array.isArray(result?.items) ? result.items : [];

  const pageWindow = useMemo(() => {
    const cur = page;
    const start = Math.max(1, cur - 3);
    const end = Math.min(totalPages, start + 6);
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className="jobsearch-page">
      <section className="jobsearch-hero">
        <div className="jobsearch-hero-inner">
          <h1 className="jobsearch-title">
            {query ? (
              <>
                Намерени са <b>{totalItems}</b> обяви с ключова дума{" "}
                <span className="jobsearch-q">{query}</span>
              </>
            ) : (
              <>Търсене на обяви</>
            )}
          </h1>

          <form className="jobsearch-form" onSubmit={submit}>
            <input
              className="jobsearch-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Търси по ключова дума в текстовете на всички обяви"
            />
            <button className="jobsearch-btn" type="submit" aria-label="Search">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="jobsearch-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>
          </form>
        </div>
      </section>

      <section className="jobsearch-body">
        {loading ? (
          <div className="jobsearch-loading">
            <div className="spinner" />
            <div>Зареждане…</div>
          </div>
        ) : !query ? (
          <div className="jobsearch-empty">
            Въведи ключова дума, за да потърсиш обяви.
          </div>
        ) : items.length === 0 ? (
          <div className="jobsearch-empty">
            Няма резултати за <b>{query}</b>.
          </div>
        ) : (
          <>
            <div className="jobsearch-cards">
              {items.map((job) => (
              <article
  key={job.id}
  className="jobsearch-card"
  onClick={() => navigate(`/company/jobads/${job.id}`)}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`/company/jobads/${job.id}`);
    }
  }}
  role="link"
  tabIndex={0}
>

                  <div className="jobsearch-left">
                    {job.companyLogoUrl ? (
                      <img className="jobsearch-logo" src={job.companyLogoUrl} alt={job.companyName} />
                    ) : (
                      <div className="jobsearch-logo-fallback">{job.companyName?.[0] ?? "?"}</div>
                    )}
                    <div className="jobsearch-company">{job.companyName}</div>
                  </div>

                  <div className="jobsearch-mid">
                    <div className="jobsearch-jobtitle">{job.title}</div>

                    <div className="jobsearch-meta">
                      {!job.isRemote && job.location ? (
                        <span className="pill">{cityOnly(job.location)}</span>
                      ) : null}

                      {job.isRemote ? (
                        <span className="pill pill-remote">
                          <img src={homeOfficeIcon} alt="Remote" className="pill-icon" loading="lazy" />
                          Fully Remote
                        </span>
                      ) : (
                        <span className="pill">
                          <img src={hybridIcon} alt="Hybrid" className="pill-icon" loading="lazy" />
                          Hybrid
                        </span>
                      )}

                      {job.jobType ? <span className="pill">{job.jobType}</span> : null}
                      {job.experienceLevel ? <span className="pill">{job.experienceLevel}</span> : null}
                      {job.salaryRange ? <span className="pill">{job.salaryRange}</span> : null}
                    </div>

                    <div className="jobsearch-techs">
                      {(job.techs || []).slice(0, 10).map((t) => (
                        <span key={t.id ?? t.slug ?? t.name} className="tech tech-icon" title={t.name}>
                          {t.logoUrl ? (
                            <img src={iconifyColorize(t.logoUrl)} alt={t.name} />
                          ) : (
                            <span className="tech-fallback">{t.name?.[0] ?? "?"}</span>
                          )}
                        </span>
                      ))}
                      {(job.techs || []).length > 10 ? (
                        <span className="tech-more">+{job.techs.length - 10}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="jobsearch-right">
                    {/* само posted date */}
                    <div className="jobsearch-date">
                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString("bg-BG") : ""}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="jobsearch-pagination">
              <button
                disabled={page <= 1}
                onClick={() => setParam("page", page - 1, { resetPage: false, scrollTop: true })}
              >
                ←
              </button>

              {pageWindow.map((p) => (
                <button
                  key={p}
                  className={p === page ? "active" : ""}
                  onClick={() => setParam("page", p, { resetPage: false, scrollTop: true })}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={page >= totalPages}
                onClick={() => setParam("page", page + 1, { resetPage: false, scrollTop: true })}
              >
                →
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
