import { useEffect } from "react";
import "./JobMapModal.css";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix default marker icons (Vite/React issue)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const cityCoords = {
  sofia: [42.6977, 23.3219],
  plovdiv: [42.1354, 24.7453],
  varna: [43.2141, 27.9147],
  burgas: [42.5048, 27.4626],
  ruse: [43.8356, 25.9657],
  "stara zagora": [42.4258, 25.6345],
  pleven: [43.4083, 24.6206],
  vidin: [43.9962, 22.8679],
  blagoevgrad: [42.0209, 23.0943],
  shumen: [43.2712, 26.9361],
  dobirch: [43.5726, 27.8273],
  dobrich: [43.5726, 27.8273],
  pernik: [42.6052, 23.0378],
  gabrovo: [42.8742, 25.3346],
  sliven: [42.6817, 26.3229],
  haskovo: [41.9342, 25.5556],
  yambol: [42.4833, 26.5],
  pazardzhik: [42.1928, 24.3336],
  vratsa: [43.2047, 23.5528],
  "veliko tarnovo": [43.0757, 25.6172],
};

function normalizeCity(locationText) {
  const raw = String(locationText || "")
    .toLowerCase()
    .trim();
  if (!raw) return "";

  // examples: "Varna, Bulgaria", "Офис Варна", "Office Varna"
  // take first part before comma
  const first = raw.split(",")[0].trim();

  // remove common prefixes
  const cleaned = first
    .replace("офис", "")
    .replace("office", "")
    .replace("гр.", "")
    .replace("city", "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}

export default function JobMapModal({
  open,
  onClose,
  locationText,
  title,
  companyName,
}) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const city = normalizeCity(locationText);
  const coords = cityCoords[city] || cityCoords["sofia"]; // fallback center
  const popupText = `${title || ""}${companyName ? ` | ${companyName}` : ""}${locationText ? ` | ${locationText}` : ""}`;

  return (
    <div className="jmm-overlay" onMouseDown={onClose}>
      <div className="jmm-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button
          className="jmm-close"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="jmm-mapwrap">
          <MapContainer
            center={coords}
            zoom={12}
            scrollWheelZoom
            className="jmm-map"
          >
            <TileLayer
              attribution="&copy; JawgMaps | Данни от OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={coords}>
              <Popup>{popupText}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
