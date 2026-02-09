import { useEffect, useMemo, useState } from "react";
import { filesService } from "../services/api/filesService";
import "./MyFiles.css";

const formatBytes = (bytes) => {
  if (bytes == null) return "-";
  const units = ["B", "K", "M", "G"];
  let n = Number(bytes);
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  const v = i === 0 ? Math.round(n) : Math.round(n * 10) / 10;
  return `${v}${units[i]}`;
};

export default function MyFiles() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canUpload = useMemo(() => !!selected && !isUploading, [selected, isUploading]);

  const load = async () => {
    setError("");
    setIsLoading(true);
    try {
      const data = await filesService.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Не успях да заредя файловете.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onPick = (e) => {
    setError("");
    setSuccess("");
    setSelected(e.target.files?.[0] ?? null);
  };

  const onUpload = async () => {
    if (!selected) return;

    setError("");
    setSuccess("");
    setIsUploading(true);

    try {
      const created = await filesService.upload(selected);

      // ако upload endpoint връща различна форма, пак го добавяме отпред
      setItems((prev) => [created, ...prev]);

      setSelected(null);
      const input = document.getElementById("myfiles-input");
      if (input) input.value = "";

      setSuccess("Файлът е качен.");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        (Array.isArray(e?.response?.data?.errors) ? e.response.data.errors.join(", ") : null) ||
        "Качването не успя.";
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const onDelete = async (id) => {
    setError("");
    setSuccess("");
    setDeletingId(id);

    try {
      await filesService.remove(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      setSuccess("Файлът е премахнат.");
    } catch (e) {
      setError(e?.response?.data?.message || "Премахването не успя.");
    } finally {
      setDeletingId(null);
    }
  };

  const onDownload = async (id) => {
    setError("");
    setSuccess("");
    setDownloadingId(id);
    try {
      await filesService.download(id); // ✅ must exist in your frontend service
    } catch (e) {
      setError(e?.response?.data?.message || "Изтеглянето не успя.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="myfiles">
      {(error || success) && (
        <div className={`myfiles-flash ${error ? "is-error" : "is-success"}`}>
          {error || success}
        </div>
      )}

      <div className="myfiles-grid">
        {/* LEFT: Upload */}
        <section className="myfiles-card">
          <div className="myfiles-card-head">
            <div className="myfiles-card-title">Качи файл</div>
            <div className="myfiles-underline" />
          </div>

          <div className="myfiles-hint">
            <div>Можеш да качиш неограничен брой файлове.</div>
            <div className="myfiles-hint-strong">
              Разрешени формати: jpg, jpeg, png, pdf, doc, docx, ppt, pptx
            </div>
          </div>

          <div className="myfiles-picker">
            <input
              id="myfiles-input"
              className="myfiles-file-input"
              type="file"
              onChange={onPick}
              disabled={isUploading}
            />
            <div className="myfiles-selected">{selected ? selected.name : ""}</div>
            <label className="myfiles-pick-btn" htmlFor="myfiles-input">
              Избери файл
            </label>
          </div>

          <button
            className="myfiles-upload-btn"
            type="button"
            onClick={onUpload}
            disabled={!canUpload}
          >
            {isUploading ? "Качване…" : "Качване на файла"}
          </button>
        </section>

        {/* RIGHT: List */}
        <section className="myfiles-card">
          <div className="myfiles-card-head">
            <div className="myfiles-card-title">Качени файлове</div>
            <div className="myfiles-underline" />
          </div>

          {isLoading ? (
            <div className="myfiles-loading">Зареждане…</div>
          ) : items.length === 0 ? (
            <div className="myfiles-empty">Няма качени файлове.</div>
          ) : (
            <div className="myfiles-list">
              {items.map((f, idx) => {
                const displayName = f.originalName || f.fileName || f.name || `Файл #${f.id}`;

                return (
                  <div
                    className={`myfiles-item ${downloadingId === f.id ? "is-downloading" : ""}`}
                    key={f.id}
                    role="button"
                    tabIndex={0}
                    title="Кликни за изтегляне"
                    onClick={() => onDownload(f.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") onDownload(f.id);
                    }}
                  >
                    <div className="myfiles-item-left">
                      <div className="myfiles-item-name">
                        {idx + 1}. {displayName}{" "}
                        <span className="myfiles-item-size">({formatBytes(f.sizeBytes)})</span>
                        {downloadingId === f.id ? (
                          <span className="myfiles-item-downloading"> • Изтегляне…</span>
                        ) : null}
                      </div>
                    </div>

                    <button
                      className="myfiles-remove-btn"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); // ✅ do not download when deleting
                        onDelete(f.id);
                      }}
                      disabled={deletingId === f.id}
                      title="Премахни"
                    >
                      {deletingId === f.id ? "..." : "Премахни"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
