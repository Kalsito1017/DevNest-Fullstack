// CompanySelectLocation.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import "./CompanySelectLocation.css";

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

const cityOnly = (loc) => (loc ? String(loc).split(",")[0].trim() : "");

function normalizeSlug(raw) {
  const s = decodeURIComponent(String(raw || "")).trim().toLowerCase();
  if (!s) return "";

  // Handle accidental "locationsofia"
  if (s.startsWith("location") && s.length > "location".length) {
    return s.replace(/^location/i, "").trim().toLowerCase();
  }
  return s;
}

function labelFromSlug(slug) {
  switch ((slug || "").toLowerCase()) {
    case "sofia":
      return "София";
    case "plovdiv":
      return "Пловдив";
    case "varna":
      return "Варна";
    case "burgas":
      return "Бургас";
    case "ruse":
      return "Русе";
    case "remote":
      return "Remote";
    default:
      if (!slug) return "";
      return slug.charAt(0).toUpperCase() + slug.slice(1);
  }
}

export default function CompanySelectLocation() {
  const navigate = useNavigate();
  const q = useQuery();
  const params = useParams();

  // ✅ supports both query and route param
  // - /company/select/location?location=Sofia
  // - /company/select/location/sofia
  const fromQuery = parseMulti(q.get("location"))[0] || "";
  const fromParam = params.locationSlug ?? params.city ?? params.location ?? "";

  // Decide which one we have
  const selectedLocationRaw = useMemo(() => {
    if (fromQuery) return fromQuery; // raw like "Sofia" or "Sofia, Bulgaria"
    if (fromParam) return normalizeSlug(fromParam); // slug like "sofia"
    return "";
  }, [fromQuery, fromParam]);

  // For title: if it's slug -> map; if it's raw -> cityOnly
  const selectedLocationTitle = useMemo(() => {
    if (!selectedLocationRaw) return "";
    const looksLikeSlug =
      !selectedLocationRaw.includes(",") &&
      selectedLocationRaw === selectedLocationRaw.toLowerCase();

    if (looksLikeSlug) return labelFromSlug(selectedLocationRaw);

    const rawCity = cityOnly(selectedLocationRaw);
    return labelFromSlug(rawCity.toLowerCase()) || rawCity;
  }, [selectedLocationRaw]);

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ✅ backend expects: random | alpha | newest
  const [sort, setSort] = useState(q.get("sort") || "random");

  useEffect(() => {
    if (!selectedLocationRaw) return;

    let alive = true;

    const load = async () => {
      setLoading(true);
      setErr("");

      try {
        const qs = new URLSearchParams();
        qs.set("sort", sort);

        // ✅ If selectedLocationRaw is slug ("sofia") send slug.
        // ✅ If it's raw ("Sofia, Bulgaria") send raw.
        qs.set("location", selectedLocationRaw);

        // ✅ always show only active (no toggle)
        qs.set("onlyActive", "true");

        const res = await fetch(`${API}/companies?${qs.toString()}`);
        if (!alive) return;

        if (!res.ok) {
          setErr("Грешка при зареждане на компании.");
          setCompanies([]);
          return;
        }

        const data = await res.json();
        if (!alive) return;

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];

        setCompanies(list);
      } catch {
        if (!alive) return;
        setErr("Грешка при зареждане на компании.");
        setCompanies([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [selectedLocationRaw, sort]);

  if (!selectedLocationRaw) {
    return (
      <div className="companies-page">
        <div className="page-loader">Missing location.</div>
      </div>
    );
  }

  return (
    <div className="companies-page">
      <section className="companies-hero">
        <div className="companies-hero-text">
          <h1 className="companies-title">Компании в {selectedLocationTitle}</h1>
          <p className="companies-sub">
            Разгледай компании по локация и намери най-подходящия работодател.
          </p>
        </div>

        <div className="companies-controls">
          <select
            className="companies-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="random">Случайни</option>
            <option value="alpha">По име</option>
            <option value="newest">Най-нови</option>
          </select>

          <button
            type="button"
            className="companies-back"
            onClick={() => navigate(-1)}
          >
            ← Назад
          </button>
        </div>
      </section>

      {loading ? (
        <div className="companies-loader">
          <div className="spinner" />
          <div>Зареждам компании…</div>
        </div>
      ) : err ? (
        <div className="companies-error">{err}</div>
      ) : companies.length === 0 ? (
        <div className="companies-empty">
          Няма намерени компании за <b>{selectedLocationTitle}</b>.
        </div>
      ) : (
        <div className="companies-grid">
          {companies.map((c) => (
            <Link key={c.id} to={`/company/${c.id}`} className="company-card">
              <div className="company-card-top">
                {c.logoUrl ? (
                  <img className="company-logo" src={c.logoUrl} alt={c.name} />
                ) : (
                  <div className="company-logo-fallback">{c.name?.[0] ?? "?"}</div>
                )}
                <div className="company-name">{c.name}</div>
              </div>

              <div className="company-meta">
                {c.location ? <span className="pill">{cityOnly(c.location)}</span> : null}
                {c.size ? <span className="pill">{c.size} Брой IT служители</span> : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
