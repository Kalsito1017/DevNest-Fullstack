import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Job.css";

import hybridIcon from "../../../assets/hybrid.png";
import homeOfficeIcon from "../../../assets/homeoffice.png";

import { useAuth } from "../../../context/AuthContext";
import { savedJobsService } from "../../../services/api/savedJobsService";

const API = "http://localhost:5099/api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const parseMulti = (val) =>
  (val || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const unique = (arr) => Array.from(new Set(arr));

const iconifyColorize = (url) => {
  if (!url || typeof url !== "string") return url;
  if (url.includes("api.iconify.design") && !url.includes("color=")) {
    const join = url.includes("?") ? "&" : "?";
    return `${url}${join}color=%232f52ff`;
  }
  return url;
};

// City-only display helper (keeps filtering by raw value)
const cityOnly = (loc) => (loc ? String(loc).split(",")[0].trim() : "");

// ---- Normalizers / sorters (job type) ----
const normalizeJobType = (v) => {
  const s = String(v || "").trim();
  if (!s) return "";
  const low = s.toLowerCase();

  if (low.includes("full")) return "Full-time";
  if (low.includes("intern")) return "Internship";
  if (low.includes("part")) return "Part-time";
  if (low.includes("contract")) return "Contract";

  return s.charAt(0).toUpperCasesweCase() + s.slice(1);
};

const jobTypeOrder = (v) => {
  const x = normalizeJobType(v);
  if (x === "Full-time") return 1;
  if (x === "Internship") return 2;
  if (x === "Part-time") return 3;
  if (x === "Contract") return 4;
  return 99;
};

// Salary helpers for slider
const parseSalaryBounds = (value) => {
  const s = String(value || "")
    .replace(/–/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  const nums = (s.match(/\d[\d\s]*/g) || [])
    .map((x) => Number(x.replace(/\s/g, "")))
    .filter(Number.isFinite);

  if (nums.length === 0) return { min: null, max: null, label: s || "—" };
  if (s.includes("+")) return { min: nums[0], max: null, label: `${nums[0]}+` };
  if (nums.length === 1) return { min: nums[0], max: nums[0], label: `${nums[0]}` };

  const min = Math.min(nums[0], nums[1]);
  const max = Math.max(nums[0], nums[1]);
  return { min, max, label: `${min} - ${max}` };
};

const formatBGN = (n) => {
  if (n == null) return "";
  return new Intl.NumberFormat("bg-BG").format(n);
};

export default function Jobs() {
  const q = useQuery();
  const navigate = useNavigate();
  const { user } = useAuth();

  const category = q.get("category") || "";

  const tech = q.get("tech") || "";
  const selectedLocations = parseMulti(q.get("location"));
  const selectedExperience = parseMulti(q.get("experienceLevel"));
  const selectedJobTypes = parseMulti(q.get("jobType"));

  // Salary slider uses single value (still stored as salaryRange=<string>)
  const selectedSalary = parseMulti(q.get("salaryRange"));

  const sort = q.get("sort") || "newest";
  const page = Math.max(1, Number(q.get("page") || 1));
  const pageSize = Math.min(50, Math.max(5, Number(q.get("pageSize") || 10)));

  const [summary, setSummary] = useState(null);
  const [result, setResult] = useState(null);

  const [facetsLocation, setFacetsLocation] = useState(null);
  const [facetsExp, setFacetsExp] = useState(null);
  const [facetsJobType, setFacetsJobType] = useState(null);
  const [facetsSalary, setFacetsSalary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  const [open, setOpen] = useState({
    where: true,
    exp: true,
    type: true,
    salary: true,
  });

  // saved state in this list (jobId -> boolean)
  const [savedMap, setSavedMap] = useState({}); // { [id]: true }

  const facetList = (arr) => (Array.isArray(arr) ? arr : []);

  const setParam = (key, value, { resetPage = true, scrollTop = false } = {}) => {
    const next = new URLSearchParams(q);

    if (value === "" || value == null) next.delete(key);
    else next.set(key, String(value));

    if (resetPage) next.set("page", "1");

    navigate(`/jobs?${next.toString()}`);

    if (scrollTop) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleMulti = (key, value) => {
    const cur = parseMulti(q.get(key));
    const has = cur.includes(value);
    const nextVals = has ? cur.filter((x) => x !== value) : unique([...cur, value]);
    setParam(key, nextVals.join(","), { resetPage: true, scrollTop: false });
  };

  const clearMulti = (key) => setParam(key, "", { resetPage: true, scrollTop: false });

  const buildApiQueryString = (overrides = {}) => {
    const params = new URLSearchParams();

    const vCategory = overrides.category ?? category;
    const vTech = overrides.tech ?? tech;

    const vLocation = overrides.location ?? selectedLocations.join(",");
    const vExp = overrides.experienceLevel ?? selectedExperience.join(",");
    const vJobType = overrides.jobType ?? selectedJobTypes.join(",");
    const vSalary = overrides.salaryRange ?? (selectedSalary[0] || "");
    const vSort = overrides.sort ?? sort;

    if (vCategory) params.set("category", vCategory);
    if (vTech) params.set("tech", vTech);

    if (vLocation) params.set("location", vLocation);
    if (vExp) params.set("experienceLevel", vExp);
    if (vJobType) params.set("jobType", vJobType);
    if (vSalary) params.set("salaryRange", vSalary);

    if (vSort) params.set("sort", vSort);

    params.set("page", String(overrides.page ?? page));
    params.set("pageSize", String(overrides.pageSize ?? pageSize));

    return params.toString();
  };

  const clearAllFilters = () => {
    const next = new URLSearchParams(q);
    ["tech", "location", "experienceLevel", "jobType", "salaryRange", "sort"].forEach((k) => next.delete(k));
    next.set("page", "1");
    next.set("pageSize", String(pageSize));
    navigate(`/jobs?${next.toString()}`);
  };

  const hasAnyFilter =
    !!tech ||
    selectedLocations.length > 0 ||
    selectedExperience.length > 0 ||
    selectedJobTypes.length > 0 ||
    selectedSalary.length > 0 ||
    (sort && sort !== "newest");

  useEffect(() => {
    if (!category) return;

    const load = async () => {
      setIsFiltering(true);
      setLoading(result == null);

      try {
        const qsJobs = buildApiQueryString();

        // facets ignoring itself:
        const qsLocFacets = buildApiQueryString({ location: "" });
        const qsExpFacets = buildApiQueryString({ experienceLevel: "" });
        const qsTypeFacets = buildApiQueryString({ jobType: "" });
        const qsSalaryFacets = buildApiQueryString({ salaryRange: "" });

        const [sumRes, jobsRes, fLocRes, fExpRes, fTypeRes, fSalRes] = await Promise.all([
          fetch(`${API}/categories/${encodeURIComponent(category)}/summary`),
          fetch(`${API}/jobs/search?${qsJobs}`),
          fetch(`${API}/jobs/facets?${qsLocFacets}`),
          fetch(`${API}/jobs/facets?${qsExpFacets}`),
          fetch(`${API}/jobs/facets?${qsTypeFacets}`),
          fetch(`${API}/jobs/facets?${qsSalaryFacets}`),
        ]);

        const sum = sumRes.ok ? await sumRes.json() : null;
        const jobs = jobsRes.ok ? await jobsRes.json() : null;

        const fl = fLocRes.ok ? await fLocRes.json() : null;
        const fe = fExpRes.ok ? await fExpRes.json() : null;
        const ft = fTypeRes.ok ? await fTypeRes.json() : null;
        const fs = fSalRes.ok ? await fSalRes.json() : null;

        setSummary(sum);
        setResult(jobs);

        setFacetsLocation(fl);
        setFacetsExp(fe);
        setFacetsJobType(ft);
        setFacetsSalary(fs);

        // preload saved state (only if logged)
        if (user && jobs?.items?.length) {
          try {
            // best endpoint: /api/saved-jobs/ids (if you added it)
            const r = await fetch(`${API}/saved-jobs/ids`, { credentials: "include" });
            if (r.ok) {
              const ids = await r.json(); // int[]
              const m = {};
              (ids || []).forEach((id) => (m[id] = true));
              setSavedMap(m);
            }
          } catch {
            // ignore if endpoint not present yet
          }
        } else if (!user) {
          setSavedMap({});
        }
      } catch (e) {
        console.error(e);
        setSummary(null);
        setResult(null);
        setFacetsLocation(null);
        setFacetsExp(null);
        setFacetsJobType(null);
        setFacetsSalary(null);
      } finally {
        setLoading(false);
        setTimeout(() => setIsFiltering(false), 250);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, tech, sort, page, pageSize, q.toString(), user?.id]);

  const toggleSave = async (jobId) => {
    if (!user) return; // UI hides button anyway

    try {
      const { saved } = await savedJobsService.toggle(jobId);
      setSavedMap((prev) => ({ ...prev, [jobId]: saved }));
    } catch (e) {
      console.error(e);
      // optional: show toast/flash
    }
  };

  const totalItems = result?.totalItems ?? 0;
  const totalPages = result?.totalPages ?? 0;

  const pageWindow = useMemo(() => {
    const cur = page;
    const start = Math.max(1, cur - 3);
    const end = Math.min(totalPages, start + 6);
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);
  }, [page, totalPages]);

  // ---------- Derived (no hooks) ----------
  const fixedJobTypes = facetList(facetsJobType?.jobTypes)
    .map((x) => ({ ...x, value: normalizeJobType(x.value) }))
    .filter((x) => x.value)
    .sort((a, b) => jobTypeOrder(a.value) - jobTypeOrder(b.value) || a.value.localeCompare(b.value));

  const fixedSalaryRanges = facetList(facetsSalary?.salaryRanges)
    .map((x) => ({ ...x, value: String(x.value || "").trim() }))
    .filter((x) => x.value);

  // Salary slider stops (NO useMemo - avoids hook order issues)
  const salaryStops = [
    { value: "", count: 0, min: null, max: null, pretty: "Без значение" },
    ...fixedSalaryRanges
      .map((x) => {
        const b = parseSalaryBounds(x.value);
        return { ...x, min: b.min, max: b.max, pretty: b.label };
      })
      .filter((x) => x.min != null)
      .sort((a, b) => (a.min ?? 999999999) - (b.min ?? 999999999)),
  ];

  const currentSalaryValue = selectedSalary[0] || "";
  const currentSalaryIndex = Math.max(0, salaryStops.findIndex((s) => s.value === currentSalaryValue));
  const currentSalaryStop = salaryStops[currentSalaryIndex] || salaryStops[0];

  const salaryReadout = (() => {
    if (!currentSalaryStop.value) return "Без значение";
    const minTxt = currentSalaryStop.min != null ? formatBGN(currentSalaryStop.min) : "";
    const maxTxt = currentSalaryStop.max != null ? formatBGN(currentSalaryStop.max) : "";
    if (currentSalaryStop.max == null) return `От ${minTxt}+ BGN`;
    return `От ${minTxt} до ${maxTxt} BGN`;
  })();

  // ---------- Rendering ----------
  if (!category) return <div className="jobs-page">Missing category.</div>;

  if (loading && !result)
    return (
      <div className="jobs-page">
        <div className="page-loader">Loading…</div>
      </div>
    );

  if (!result) return <div className="jobs-page">No results.</div>;

  const titleName = summary?.categoryName || category;

  const FilterSection = ({ id, title, subtitle, children }) => (
    <div className="filters-card">
      <button
        type="button"
        className="filters-head"
        onClick={() => setOpen((s) => ({ ...s, [id]: !s[id] }))}
        aria-expanded={open[id] ? "true" : "false"}
      >
        <div className="filters-head-text">
          <div className="filters-title">{title}</div>
          <div className="filters-muted">{subtitle}</div>
        </div>
        <span className={`chev ${open[id] ? "open" : ""}`}>▾</span>
      </button>

      {open[id] ? <div className="filters-body">{children}</div> : null}
    </div>
  );

  return (
    <div className="jobs-page">
      <section className="jobs-hero">
        <div className="jobs-hero-icon">{summary?.iconUrl ? <img src={summary.iconUrl} alt={titleName} /> : null}</div>

        <div className="jobs-hero-text">
          <h1>
            <span className="jobs-hero-title">{titleName}</span> обяви за работа
          </h1>

          <p className="jobs-hero-sub">
            Потърси желаната от теб <b>{titleName}</b> работа сред селекция от <b>{summary?.totalJobs ?? totalItems}</b>{" "}
            предлагани обяви. Филтрирай по град, заплата, опит и начин на работа.
          </p>
        </div>
      </section>

      <div className="jobs-layout">
        <aside className="jobs-filters">
          <FilterSection id="where" title="От къде ще работя" subtitle="Избери локации.">
            <div className="filters-list">
              {facetList(facetsLocation?.locations).map((l) => {
                const raw = String(l.value || "").trim();
                if (!raw) return null;

                const active = selectedLocations.includes(raw);
                const display = cityOnly(raw);

                return (
                  <button
                    key={raw}
                    type="button"
                    className={`filter-row ${active ? "active" : ""}`}
                    onClick={() => toggleMulti("location", raw)}
                  >
                    <span className="filter-label">{display}</span>
                    <span className="filter-count">{l.count}</span>
                  </button>
                );
              })}
            </div>

            {selectedLocations.length > 0 ? (
              <button className="filter-clear" type="button" onClick={() => clearMulti("location")}>
                Изчисти
              </button>
            ) : null}
          </FilterSection>

          <div style={{ marginTop: 12 }}>
            <FilterSection id="exp" title="Seniority" subtitle="Филтър по опит.">
              <div className="filters-list">
                {facetList(facetsExp?.experienceLevels)
                  .filter((e) => String(e.value || "").trim())
                  .map((e) => {
                    const v = String(e.value).trim();
                    const active = selectedExperience.includes(v);
                    return (
                      <button
                        key={v}
                        type="button"
                        className={`filter-row ${active ? "active" : ""}`}
                        onClick={() => toggleMulti("experienceLevel", v)}
                      >
                        <span className="filter-label">{v}</span>
                        <span className="filter-count">{e.count}</span>
                      </button>
                    );
                  })}
              </div>

              {selectedExperience.length > 0 ? (
                <button className="filter-clear" type="button" onClick={() => clearMulti("experienceLevel")}>
                  Изчисти
                </button>
              ) : null}
            </FilterSection>
          </div>

          <div style={{ marginTop: 12 }}>
            <FilterSection id="type" title="Тип" subtitle="Full-time / Internship / Part-time / Contract">
              <div className="filters-list">
                {fixedJobTypes.map((jt) => {
                  const active = selectedJobTypes.includes(jt.value);
                  return (
                    <button
                      key={jt.value}
                      type="button"
                      className={`filter-row ${active ? "active" : ""}`}
                      onClick={() => toggleMulti("jobType", jt.value)}
                    >
                      <span className="filter-label">{jt.value}</span>
                      <span className="filter-count">{jt.count}</span>
                    </button>
                  );
                })}
              </div>

              {selectedJobTypes.length > 0 ? (
                <button className="filter-clear" type="button" onClick={() => clearMulti("jobType")}>
                  Изчисти
                </button>
              ) : null}
            </FilterSection>
          </div>

          <div style={{ marginTop: 12 }}>
            <FilterSection id="salary" title="Заплата" subtitle="Плъзни за диапазон (BGN)">
              {salaryStops.length <= 1 ? (
                <div className="filters-empty">Няма налични диапазони.</div>
              ) : (
                <div className="salary-slider">
                  <div className="salary-readout">{salaryReadout}</div>

                  <input
                    className="salary-range"
                    type="range"
                    min={0}
                    max={salaryStops.length - 1}
                    step={1}
                    value={currentSalaryIndex}
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      const stop = salaryStops[idx] || salaryStops[0];
                      setParam("salaryRange", stop.value ? stop.value : "");
                    }}
                  />

                  <div className="salary-ends">
                    <span>Без</span>
                    <span>
                      {(() => {
                        const last = salaryStops[salaryStops.length - 1];
                        if (!last) return "";
                        if (last.max != null) return formatBGN(last.max);
                        if (last.min != null) return formatBGN(last.min);
                        return "";
                      })()}
                    </span>
                  </div>

                  {selectedSalary.length > 0 ? (
                    <button className="filter-clear" type="button" onClick={() => clearMulti("salaryRange")}>
                      Изчисти
                    </button>
                  ) : null}
                </div>
              )}
            </FilterSection>
          </div>

          {hasAnyFilter ? (
            <div className="filters-card" style={{ marginTop: 12 }}>
              <button className="filter-reset" type="button" onClick={clearAllFilters}>
                Изчисти всички филтри
              </button>
            </div>
          ) : null}
        </aside>

        <main className="jobs-results">
          {isFiltering ? (
            <div className="results-overlay" aria-hidden="true">
              <div className="overlay-box">
                <div className="spinner" />
                <div className="overlay-text">Updating results…</div>
              </div>
            </div>
          ) : null}

          <div className="jobs-results-head">
            <div className="jobs-count">{totalItems} обяви</div>

            <select value={sort} onChange={(e) => setParam("sort", e.target.value)} className="jobs-sort">
              <option value="newest">Най-нови</option>
              <option value="deadline">По срок</option>
            </select>
          </div>

          <div className="jobs-cards">
           {result.items.map((job) => {
  const isSaved = !!savedMap[job.id];

  return (
   <article
  key={job.id}
  className="job-card job-card-v2"
  role="link"
  tabIndex={0}
  onClick={() => navigate(`/company/jobads/${job.id}`)}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`/company/jobads/${job.id}`);
    }
  }}
>

      {/* LEFT: logo + company */}
      <div className="jc-left">
        {job.companyLogoUrl ? (
          <img className="jc-logo" src={job.companyLogoUrl} alt={job.companyName} />
        ) : (
          <div className="jc-logo-fallback">{job.companyName?.[0] ?? "?"}</div>
        )}
        <div className="jc-company">
          <div className="jc-company-name">{job.companyName}</div>
        </div>
      </div>

      {/* MID: title + bottom meta */}
      <div className="jc-mid">
        <div className="jc-title">{job.title}</div>

        <div className="jc-bottom">
          {/* location pill only if NOT remote */}
          {!job.isRemote && job.location ? (
            <span className="jc-pill jc-pill-location">📍 {cityOnly(job.location)}</span>
          ) : null}

          {/* remote/hybrid */}
          {job.isRemote ? (
            <span className="jc-pill jc-pill-remote">
              <img src={homeOfficeIcon} alt="Remote" className="jc-pill-icon" loading="lazy" />
              Remote
            </span>
          ) : (
            <span className="jc-pill">
              <img src={hybridIcon} alt="Hybrid" className="jc-pill-icon" loading="lazy" />
              Hybrid
            </span>
          )}
        </div>
      </div>

      {/* RIGHT: top actions + techs */}
      <div className="jc-right">
        <div className="jc-top">
          <div className="jc-date" title="Публикувана">
            <span className="jc-cal">🗓️</span>
            {new Date(job.createdAt).toLocaleDateString("bg-BG", { day: "numeric", month: "short" })}
          </div>

          {user ? (
            <button
              type="button"
              className={`jc-save ${isSaved ? "is-saved" : ""}`}
              title={isSaved ? "Премахни от запазени" : "Запази обявата"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSave(job.id);
              }}
              aria-label="Запази обявата"
            >
              📌
            </button>
          ) : null}
        </div>

        <div className="jc-techs">
          {(job.techs || []).slice(0, 9).map((t) => (
            <span key={t.id ?? t.slug ?? t.name} className="jc-tech" title={t.name}>
              {t.logoUrl ? (
                <img src={iconifyColorize(t.logoUrl)} alt={t.name} />
              ) : (
                <span className="jc-tech-fallback">{t.name?.[0] ?? "?"}</span>
              )}
            </span>
          ))}

          {(job.techs || []).length > 9 ? (
            <span className="jc-tech-more">+{job.techs.length - 9}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
})}

          </div>

          <div className="jobs-pagination">
            <button disabled={page <= 1} onClick={() => setParam("page", page - 1, { resetPage: false, scrollTop: true })}>
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
        </main>
      </div>
    </div>
  );
}
