import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

import L from "leaflet";
import { getCompaniesForMap } from "../../services/api/companies";
import "./CompanyMap.css";

// Fix default marker icon paths (Leaflet + bundlers issue)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// City centers (BG) + Remote (we'll place remote to the side)
const CITY_COORDS = {
  Sofia: [42.6977, 23.3219],
  Varna: [43.2141, 27.9147],
  Plovdiv: [42.1354, 24.7453],
  Burgas: [42.5048, 27.4626],
  Ruse: [43.8356, 25.9657],
  Remote: [42.9, 25.2], // “middle of Bulgaria” for remote
};

// Normalize stored location strings
function normalizeLocation(loc) {
  const s = (loc || "").trim().toLowerCase();
  if (!s) return "";

  if (s.includes("sofia")) return "Sofia";
  if (s.includes("varna")) return "Varna";
  if (s.includes("plovdiv")) return "Plovdiv";
  if (s.includes("burgas")) return "Burgas";
  if (s.includes("ruse") || s.includes("rousse")) return "Ruse";
  if (s.includes("remote")) return "Remote";

  return "";
}

// Deterministic “jitter” per company id so markers don’t overlap perfectly.
// This makes the map stable between renders.
function jitterLatLng([lat, lng], seed) {
  // small offset ~ within a few km
  const r1 = Math.sin(seed * 999) * 10000;
  const r2 = Math.cos(seed * 777) * 10000;

  const dLat = (r1 % 1000) / 100000; // ~0.01 max
  const dLng = (r2 % 1000) / 100000;

  return [lat + dLat, lng + dLng];
}

export default function CompanyMap() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [activeOnly, setActiveOnly] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const res = await getCompaniesForMap({ onlyActive: activeOnly });
        if (cancelled) return;
        setItems(Array.isArray(res) ? res : []);
      } catch {
        if (!cancelled) setError("Неуспешно зареждане на картата.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeOnly]);

  const markers = useMemo(() => {
    return items
      .map((c) => {
        const city = normalizeLocation(c.location);
        if (!city) return null;

        const base = CITY_COORDS[city];
        if (!base) return null;

        const [lat, lng] = jitterLatLng(base, Number(c.id || 0) + city.length * 17);
        return { ...c, city, lat, lng };
      })
      .filter(Boolean);
  }, [items]);

  return (
    <div className="company-map-page">
      <div className="map-head">
        <div>
          <div className="map-title">Компании на картата</div>
          <div className="map-sub">Маркер за всяка компания (по град/remote)</div>
        </div>

        <div className="map-actions">
          <button className="map-btn" type="button" onClick={() => navigate("/company")}>
            ← Назад към компаниите
          </button>

          <label className="map-toggle">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
            />
            Само активни компании
          </label>
        </div>
      </div>

      {error ? <div className="map-error">{error}</div> : null}

      <div className="map-shell">
        {isLoading ? (
          <div className="map-loading">Зареждане на картата...</div>
        ) : (
          <MapContainer
            center={[42.7, 25.3]}
            zoom={7}
            scrollWheelZoom
            className="leaflet-map"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

       {markers.map((m) => (
  <CircleMarker
   eventHandlers={{
    mouseover: (e) => e.target.setStyle({ radius: 7, fillOpacity: 1 }),
    mouseout: (e) => e.target.setStyle({ radius: 5, fillOpacity: 0.85 }),
  }}
    key={m.id}
    center={[m.lat, m.lng]}
    radius={5}
    pathOptions={{
      color: "#2d4cff",
      fillColor: "#2d4cff",
      fillOpacity: 0.85,
      weight: 1,
    }}
  >
    <Popup>
      <div className="popup">
        <div className="popup-title">{m.name}</div>
        <div className="popup-meta">
          {m.city} • {m.jobsCount || 0} активни обяви
        </div>
        <button
          className="popup-btn"
          type="button"
          onClick={() => navigate(`/company/${m.id}`)}
        >
          Отвори компания
        </button>
      </div>
    </Popup>
  </CircleMarker>
))}

          </MapContainer>
        )}
      </div>
    </div>
  );
}
