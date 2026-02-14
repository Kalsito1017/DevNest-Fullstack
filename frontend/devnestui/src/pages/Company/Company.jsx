import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCompanies,
  getCompanySizeStats,
  getCompanyLocationStats,
  getCompanySuggestions,
} from "../../services/api/companies";
import "./Company.css";
import companybg from "../../assets/companybackground.png";
function useDebounced(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

const safeText = (v) => (v ?? "").toString().trim();

function formatJobsLabel(count) {
  const n = Number(count || 0);
  if (n === 1) return "1 ОБЯВА";
  return `${n} ОБЯВИ`;
}

function cityFromSlug(slug) {
  if (!slug) return "";
  switch (slug.toLowerCase()) {
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
    case "remote":
      return "Remote";
    default:
      return "";
  }
}

function SizeFilterCard({ title, subtitle, count, active, onPick }) {
  return (
    <div className={active ? "size-card active" : "size-card"}>
      <div className="size-card-top">
        <div className="size-card-title">{title}</div>
        <div className="size-card-sub">{subtitle}</div>
      </div>

      <div className="size-card-bottom">
        <div className="size-card-count">{count} IT компании</div>
        <button className="size-card-link" type="button" onClick={onPick}>
          Виж всички
        </button>
      </div>
    </div>
  );
}

function CompanyCard({ company, onOpen }) {
  const jobsCount = Number(company.jobsCount || 0);
  const size = safeText(company.size);

  return (
    <button className="company-card" onClick={onOpen} type="button">
      <div className="company-banner">
        {company.logoUrl ? (
          <img className="company-banner-img" src={company.logoUrl} alt={company.name} />
        ) : (
          <div className="company-banner-fallback" />
        )}

        <div className="company-logo-pill">
          {company.logoUrl ? (
            <img className="company-logo-pill-img" src={company.logoUrl} alt={company.name} />
          ) : (
            <div className="company-logo-pill-fallback" />
          )}
        </div>
      </div>

      <div className="company-card-body">
        <div className="company-name">{company.name}</div>

        <div className="company-meta">
          {size ? (
            <div className="company-meta-row">
              <span className="company-meta-icon">👤</span>
              <span>{size} IT служители</span>
            </div>
          ) : null}
        </div>

        <div className="company-divider" />

        <div className="company-cta">
          {jobsCount > 0 ? (
            <span className="company-jobs">{formatJobsLabel(jobsCount)}</span>
          ) : (
            <span className="company-view">ВИЖ КОМПАНИЯТА</span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function Company() {
  const navigate = useNavigate();
  const { city, q } = useParams(); // /company/select/location/:city and optional /company/search/:q

  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isLocLoading, setIsLocLoading] = useState(true);
  const [error, setError] = useState("");

  const [totalCount, setTotalCount] = useState(0);
  const [items, setItems] = useState([]);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 350);

  const [sort, setSort] = useState("random"); // random | alpha | newest
  const [sizeBucket, setSizeBucket] = useState(""); // "" | micro | small | medium | large

  // ✅ keep slug, not display text
  const [locationSlug, setLocationSlug] = useState(""); // "" | "sofia" | "plovdiv" | ...

  const [stats, setStats] = useState({
    micro: 0,
    small: 0,
    medium: 0,
    large: 0,
    total: 0,
  });

  const [locStats, setLocStats] = useState([]);

  // ===== Suggestions state =====
  const searchWrapRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);

  const debouncedSuggest = useDebounced(search, 180);

  // Optional SEO route support: /company/search/:q
  useEffect(() => {
    if (!q) return;
    setSearch(q);
  }, [q]);

  // URL -> locationSlug : /company/select/location/:city
  useEffect(() => {
    if (!city) {
      setLocationSlug("");
      return;
    }
    setLocationSlug((city || "").toString().trim().toLowerCase());
  }, [city]);

  const filtersLabel = useMemo(() => {
    if (!sizeBucket) return "Всички компании";
    if (sizeBucket === "micro") return "Микро компании";
    if (sizeBucket === "small") return "Малки компании";
    if (sizeBucket === "medium") return "Средни компании";
    if (sizeBucket === "large") return "Големи компании";
    return "Всички компании";
  }, [sizeBucket]);

  // ✅ Optional: better section label when location is active
  const sectionLabel = useMemo(() => {
    if (locationSlug) return `Локация: ${cityFromSlug(locationSlug) || locationSlug}`;
    return filtersLabel;
  }, [locationSlug, filtersLabel]);

  // ===== Close suggestions on outside click =====
  useEffect(() => {
    function onDocDown(e) {
      const root = searchWrapRef.current;
      if (!root) return;
      if (!root.contains(e.target)) setIsSuggestOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  // ===== Load suggestions =====
  useEffect(() => {
    let cancelled = false;

    async function loadSuggest() {
      const term = (debouncedSuggest || "").trim();
      if (term.length < 1) {
        setSuggestions([]);
        setIsSuggestOpen(false);
        return;
      }

      setIsSuggestLoading(true);
      try {
        const res = await getCompanySuggestions({ q: term, take: 8, onlyActive: true });
        if (cancelled) return;

        const list = Array.isArray(res) ? res : [];
        setSuggestions(list);
        setIsSuggestOpen(true);
      } catch {
        if (!cancelled) {
          setSuggestions([]);
          setIsSuggestOpen(false);
        }
      } finally {
        if (!cancelled) setIsSuggestLoading(false);
      }
    }

    loadSuggest();
    return () => {
      cancelled = true;
    };
  }, [debouncedSuggest]);

  // ===== Location stats (bottom section) =====
  useEffect(() => {
    let cancelled = false;

    async function loadLoc() {
      setIsLocLoading(true);
      try {
        const res = await getCompanyLocationStats({ onlyActive: true });
        if (!cancelled) setLocStats(res || []);
      } finally {
        if (!cancelled) setIsLocLoading(false);
      }
    }

    loadLoc();
    return () => {
      cancelled = true;
    };
  }, []);

  // ===== Size stats =====
  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setIsStatsLoading(true);
      try {
        const res = await getCompanySizeStats({ onlyActive: true });
        if (cancelled) return;
        setStats({
          micro: res.micro || 0,
          small: res.small || 0,
          medium: res.medium || 0,
          large: res.large || 0,
          total: res.total || 0,
        });
      } finally {
        if (!cancelled) setIsStatsLoading(false);
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  // ===== Companies list =====
  useEffect(() => {
    let cancelled = false;

    async function loadCompanies() {
      setIsLoading(true);
      setError("");

      try {
        const res = await getCompanies({
          search: debouncedSearch,
          sort,
          onlyActive: true,
          sizeBucket,
          location: locationSlug, // ✅ send slug (sofia, plovdiv...)
        });

        if (cancelled) return;

        setTotalCount(res.totalCount || 0);
        setItems(res.items || []);
      } catch {
        if (!cancelled) setError("Неуспешно зареждане на компаниите.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCompanies();
    return () => {
      cancelled = true;
    };
    // ✅ FIXED: use locationSlug (not locationFilter)
  }, [debouncedSearch, sort, sizeBucket, locationSlug]);

  return (
    <div className="companies-page">
      <div
  className="companies-hero"
  style={{ backgroundImage: `url(${companybg})` }}
>
        <div className="companies-hero-left">
          <div className="companies-title">
            <span className="companies-title-number">{String(totalCount || 0)}</span>
            <span className="companies-title-text"> компании</span>
          </div>

          <div className="companies-subtitle">
            предлагащи IT позиции <br /> в България
          </div>

          <div className="companies-desc">
            Подробна информация за работодателите, наемащи IT специалисти в България.
            Търсене на следващия ви работодател по карта, локация, индустрия и др.
          </div>
        </div>

        <div className="companies-hero-right">
          <div className="companies-filter-card">
            <div className="companies-filter-title">Филтрирай компаниите по</div>

            <div className="companies-search" ref={searchWrapRef}>
              <label className="companies-search-label">Намери компания по име</label>

              <div className="companies-search-row">
                <input
                  className="companies-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => {
                    const term = (search || "").trim();
                    if (term.length > 0 && suggestions.length > 0) setIsSuggestOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setIsSuggestOpen(false);
                    if (e.key === "Enter") setIsSuggestOpen(false);
                  }}
                  placeholder="Напр. Endava"
                />

                <button
                  className="companies-search-btn"
                  type="button"
                  aria-label="search"
                  onClick={() => setIsSuggestOpen(false)}
                >
                  🔎
                </button>

                {isSuggestOpen ? (
                  <div className="companies-suggest">
                    {isSuggestLoading ? (
                      <div className="companies-suggest-item muted">Търсене...</div>
                    ) : suggestions.length === 0 ? (
                      <div className="companies-suggest-item muted">Няма резултати</div>
                    ) : (
                      suggestions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className="companies-suggest-item"
                          onClick={() => {
                            setIsSuggestOpen(false);
                            navigate(`/company/${s.id}`);
                          }}
                        >
                          <div className="companies-suggest-left">
                            {s.logoUrl ? (
                              <img className="companies-suggest-logo" src={s.logoUrl} alt={s.name} />
                            ) : (
                              <div className="companies-suggest-logo fallback" />
                            )}
                            <div className="companies-suggest-name">{s.name}</div>
                          </div>

                          <div className="companies-suggest-right">
                            <span className="companies-suggest-jobs">
                              {formatJobsLabel(s.jobsCount || 0)}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="companies-sort-row">
              <div className="companies-sort-label">Сортиране</div>
              <div className="companies-sort">
                <button
                  className={sort === "random" ? "sort-btn active" : "sort-btn"}
                  onClick={() => setSort("random")}
                  type="button"
                >
                  Random
                </button>
                <button
                  className={sort === "alpha" ? "sort-btn active" : "sort-btn"}
                  onClick={() => setSort("alpha")}
                  type="button"
                >
                  Азбучен ред
                </button>
                <button
                  className={sort === "newest" ? "sort-btn active" : "sort-btn"}
                  onClick={() => setSort("newest")}
                  type="button"
                >
                  Нови
                </button>
              </div>
            </div>

            <div className="companies-active-filter">
              <div className="companies-active-label">Активни филтри</div>
              <div className="companies-active-value">
                {debouncedSearch
                  ? `Търсене: ${debouncedSearch}`
                  : locationSlug
                  ? `Локация: ${cityFromSlug(locationSlug) || locationSlug}`
                  : filtersLabel}
              </div>

              <button
                className="clear-btn"
                type="button"
                onClick={() => {
                  setSearch("");
                  setSizeBucket("");
                  setLocationSlug("");
                  setIsSuggestOpen(false);
                  navigate("/company");
                }}
              >
                Изчисти
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="companies-section">
        <div className="size-filter-head">
          <div className="size-filter-title">Намери компании по брой IT служители в България</div>
          {isStatsLoading ? <div className="size-filter-loading">Зареждане...</div> : null}
        </div>

        <div className="size-grid">
          <SizeFilterCard
            title="Микро"
            subtitle="(Под 10 IT служители в България)"
            count={stats.micro}
            active={sizeBucket === "micro"}
            onPick={() => setSizeBucket("micro")}
          />
          <SizeFilterCard
            title="Малки"
            subtitle="(До 30 IT служители в България)"
            count={stats.small}
            active={sizeBucket === "small"}
            onPick={() => setSizeBucket("small")}
          />
          <SizeFilterCard
            title="Средни"
            subtitle="(До 70 IT служители в България)"
            count={stats.medium}
            active={sizeBucket === "medium"}
            onPick={() => setSizeBucket("medium")}
          />
          <SizeFilterCard
            title="Големи"
            subtitle="(Над 70 IT служители в България)"
            count={stats.large}
            active={sizeBucket === "large"}
            onPick={() => setSizeBucket("large")}
          />
        </div>

        <div className="companies-section-head">
          <div className="companies-section-title">
            Компании <span className="companies-section-sub">• {sectionLabel}</span>
          </div>
        </div>

        {error ? <div className="companies-error">{error}</div> : null}

        {isLoading ? (
          <div className="companies-skeleton-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div className="company-skeleton" key={i} />
            ))}
          </div>
        ) : (
          <div className="companies-grid">
            {items.map((c) => (
              <CompanyCard key={c.id} company={c} onOpen={() => navigate(`/company/${c.id}`)} />
            ))}
          </div>
        )}

        <div className="companies-location-section">
          <div className="loc-title">Намери компании по локация</div>

          {isLocLoading ? (
            <div className="loc-loading">Зареждане...</div>
          ) : (
            <>
              <div className="loc-grid">
                {locStats
                  .filter((x) => ["Sofia", "Plovdiv", "Varna", "Burgas", "Ruse", "Remote"].includes(x.city))
                  .map((x, idx) => (
                    <div key={x.slug || x.city} className={idx < 2 ? "loc-card big" : "loc-card"}>
                      <div className="loc-city">
                        {x.city === "Sofia"
                          ? "София"
                          : x.city === "Plovdiv"
                          ? "Пловдив"
                          : x.city === "Varna"
                          ? "Варна"
                          : x.city === "Burgas"
                          ? "Бургас"
                          : x.city === "Ruse"
                          ? "Русе"
                          : x.city === "Remote"
                          ? "Remote"
                          : x.city}
                      </div>

                      <div className="loc-count">{x.count} IT компании</div>

                      <button
                        type="button"
                        className="loc-link"
                        onClick={() => {
                          const slug = (x.slug || x.city || "").toString().trim().toLowerCase();
                          navigate(`/company/select/location/${slug}`);
                        }}
                      >
                        Виж всички
                      </button>
                    </div>
                  ))}
              </div>

              <div className="loc-map-shell">
                <div className="loc-map-bg" />
                <button type="button" className="loc-map-btn" onClick={() => navigate("/company/map")}>
                  Виж всички компании на картата
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
