import { useEffect, useMemo, useState } from "react";
import "./JobApplyModal.css";
import { applyToJob } from "../../../services/api/applications";
import { filesService } from "../../../services/api/filesService";
import { useNavigate } from "react-router-dom";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_FILES = 5;
const ALLOWED_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
]);

// ✅ Motivation letter validation to match backend (20..4000)
const MIN_LETTER = 20;
const MAX_LETTER = 4000;
const letterLen = (s) => (s || "").trim().length;

const getExt = (name = "") => {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
};

const isValidEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());

export default function JobApplyModal({ open, onClose, jobId, jobTitle, user }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [letter, setLetter] = useState("");

  const [myFiles, setMyFiles] = useState([]);
  const [selectedExistingIds, setSelectedExistingIds] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    setErr("");
    setBusy(false);
    setSuccess(false);

    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setEmail(user?.email ?? "");
    setLetter("");

    setSelectedExistingIds([]);
    setNewFiles([]);

    (async () => {
      try {
        const list = await filesService.list();
        setMyFiles(Array.isArray(list) ? list : []);
      } catch {
        setMyFiles([]);
      }
    })();
  }, [open, user]);

  const totalFiles = selectedExistingIds.length + newFiles.length;

  const canSubmit = useMemo(() => {
    if (busy) return false;

    const f = firstName.trim();
    const l = lastName.trim();
    const em = email.trim();

    if (!f || !l || !em) return false;
    if (!isValidEmail(em)) return false;

    const ll = letterLen(letter);
    if (ll < MIN_LETTER || ll > MAX_LETTER) return false;

    if (totalFiles < 1) return false;
    if (totalFiles > MAX_TOTAL_FILES) return false;

    return true;
  }, [busy, firstName, lastName, email, letter, totalFiles]);

  if (!open) return null;

  const close = (ok) => onClose?.(ok);

  const toggleExisting = (id) => {
    setSelectedExistingIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];

      const nextTotal = next.length + newFiles.length;
      if (nextTotal > MAX_TOTAL_FILES) {
        setErr(`Може да прикачите максимум ${MAX_TOTAL_FILES} файла общо.`);
        return prev;
      }

      setErr("");
      return next;
    });
  };

  const onPickNewFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;

    const badExt = picked.find((f) => !ALLOWED_EXT.has(getExt(f.name)));
    if (badExt) {
      setErr(`Неподдържан формат: ${badExt.name}`);
      e.target.value = "";
      return;
    }

    const tooBig = picked.find((f) => f.size > MAX_FILE_BYTES);
    if (tooBig) {
      setErr(`Файлът е твърде голям (макс. 10MB): ${tooBig.name}`);
      e.target.value = "";
      return;
    }

    const totalAfter = picked.length + selectedExistingIds.length + newFiles.length;
    if (totalAfter > MAX_TOTAL_FILES) {
      setErr(`Може да прикачите максимум ${MAX_TOTAL_FILES} файла общо.`);
      e.target.value = "";
      return;
    }

    setErr("");
    setNewFiles((prev) => [...prev, ...picked]);
  };

  const removeNewFile = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    const f = firstName.trim();
    const l = lastName.trim();
    const em = email.trim();
    const total = selectedExistingIds.length + newFiles.length;

    if (!f || !l) {
      setErr("Моля, въведете валидни име и фамилия.");
      return;
    }

    if (!em || !isValidEmail(em)) {
      setErr("Моля, въведете валиден email адрес.");
      return;
    }

    const ll = letterLen(letter);
    if (ll < MIN_LETTER) {
      setErr(`Мотивационното писмо трябва да е поне ${MIN_LETTER} символа.`);
      return;
    }
    if (ll > MAX_LETTER) {
      setErr(`Мотивационното писмо може да е максимум ${MAX_LETTER} символа.`);
      return;
    }

    if (total < 1) {
      setErr(
        "Не сте избрали или прикачили нито един файл. Изберете поне един файл от качените или качете нов."
      );
      return;
    }

    if (total > MAX_TOTAL_FILES) {
      setErr(`Може да прикачите максимум ${MAX_TOTAL_FILES} файла общо.`);
      return;
    }

    try {
      setBusy(true);

      const fd = new FormData();
      fd.append("jobId", String(jobId));
      fd.append("firstName", f);
      fd.append("lastName", l);
      fd.append("email", em);
      fd.append("motivationLetter", (letter || "").trim());

      selectedExistingIds.forEach((id) =>
        fd.append("existingUserFileIds", String(id))
      );
      newFiles.forEach((file) => fd.append("newFiles", file));

      await applyToJob(fd);

      setSuccess(true);
    } catch (error) {
      const payload = error?.payload;

      const motivationErr =
        payload?.errors?.MotivationLetter?.[0] ||
        payload?.errors?.motivationLetter?.[0];

      const msg = motivationErr
        ? "Мотивационното писмо трябва да е между 20 и 4000 символа."
        : payload?.message ||
          (typeof payload === "string" ? payload : "") ||
          error?.message ||
          "Неуспешно кандидатстване. Опитай пак.";

      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="jam-backdrop"
      role="dialog"
      aria-modal="true"
      onMouseDown={() => close(false)}
    >
      <div className="jam-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button
          className="jam-close"
          type="button"
          onClick={() => close(false)}
          aria-label="Затвори"
        >
          ×
        </button>

        <div className="jam-head">
          <div className="jam-title">Кандидатура</div>
          <div className="jam-subtitle">{jobTitle}</div>
        </div>

        {success ? (
          <div className="jam-success">
            <div className="jam-success-icon">✓</div>
            <div className="jam-success-text">
              Кандидатурата е изпратена успешно.
            </div>

            <div className="jam-actions">
              <button
                className="jam-btn jam-btn-primary"
                type="button"
                onClick={() => {
                  close(true);
                  navigate("/profile?tab=applications");
                }}
              >
                Към “Моите кандидатури”
              </button>
              <button className="jam-btn" type="button" onClick={() => close(false)}>
                Затвори
              </button>
            </div>
          </div>
        ) : (
          <form className="jam-form" onSubmit={submit}>
            <div className="jam-grid2">
              <div className="jam-field">
                <label>Име *</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Иван"
                />
              </div>

              <div className="jam-field">
                <label>Email *</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ivan@email.com"
                />
              </div>
            </div>

            <div className="jam-field">
              <label>Фамилия *</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Иванов"
              />
            </div>

            <div className="jam-field">
              <label>Съобщение / мотивационно писмо до компанията *</label>
              <textarea
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                placeholder="Започни да пишеш тук..."
                maxLength={MAX_LETTER}
              />
              <div className="jam-muted">
                {letterLen(letter)} / {MAX_LETTER} (мин. {MIN_LETTER})
              </div>
            </div>

            <div className="jam-split">
              <div className="jam-card">
                <div className="jam-card-title">
                  Файлове, свързани с кандидатурата Ви (макс. 10MB)*
                </div>

                <label className="jam-drop">
                  <input
                    className="jam-file-input"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.ppt,.pptx"
                    onChange={onPickNewFiles}
                  />
                  <div className="jam-drop-main">Пуснете или качете файл</div>
                  <div className="jam-drop-sub">
                    Разрешени формати: jpg, jpeg, png, pdf, doc, docx, ppt, pptx
                  </div>
                  <div className="jam-drop-sub">
                    {totalFiles} от {MAX_TOTAL_FILES}
                  </div>
                </label>

                {newFiles.length > 0 && (
                  <div className="jam-chiplist">
                    {newFiles.map((f, i) => (
                      <div key={`${f.name}-${i}`} className="jam-chip">
                        <span className="jam-chip-name" title={f.name}>
                          {f.name}
                        </span>
                        <button
                          type="button"
                          className="jam-chip-x"
                          onClick={() => removeNewFile(i)}
                          aria-label="Премахни файл"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="jam-card">
                <div className="jam-card-title">Изберете от “Моите файлове”</div>

                {myFiles.length === 0 ? (
                  <div className="jam-muted">Нямаш качени файлове.</div>
                ) : (
                  <div className="jam-list">
                    {myFiles.map((f) => (
                      <label key={f.id} className="jam-list-item">
                        <input
                          type="checkbox"
                          checked={selectedExistingIds.includes(f.id)}
                          onChange={() => toggleExisting(f.id)}
                        />
                        <span className="jam-list-name" title={f.name}>
                          {f.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {err && <div className="jam-error">{err}</div>}

            <div className="jam-actions">
              <button className="jam-btn jam-btn-primary" type="submit" disabled={!canSubmit}>
                {busy ? "Изпращане..." : "Кандидатствай"}
              </button>
              <button className="jam-btn" type="button" onClick={() => close(false)} disabled={busy}>
                Отказ
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}