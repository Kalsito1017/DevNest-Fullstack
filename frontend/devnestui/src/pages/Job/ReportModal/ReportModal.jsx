import { useEffect, useMemo, useRef, useState } from "react";
import "./ReportModal.css";
import sendIcon from "../../../assets/samoletche.jpg";
import { sendReport } from "../../../services/api/reports";

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function generateMathProblem(maxAnswer = 100) {
  const op = Math.random() < 0.5 ? "+" : "-";

  if (op === "+") {
    const a = Math.floor(Math.random() * (maxAnswer + 1)); // 0..100
    const b = Math.floor(Math.random() * (maxAnswer - a + 1)); // 0..(100-a)
    return { text: `${a} + ${b} =`, answer: a + b };
  }

  const a = Math.floor(Math.random() * (maxAnswer + 1)); // 0..100
  const b = Math.floor(Math.random() * (a + 1)); // 0..a
  return { text: `${a} - ${b} =`, answer: a - b };
}

export default function ReportModal({ onClose, jobId }) {
  // new problem on each open (component remount)
  const [problem] = useState(() => generateMathProblem(100));

  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [email, setEmail] = useState("");

  const [fieldErrors, setFieldErrors] = useState({
    reason: "",
    details: "",
    captcha: "",
    email: "",
  });

  const [formError, setFormError] = useState("");
  const [isSending, setIsSending] = useState(false);

  // UI states
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState(""); // short feedback text
  const [closeIn, setCloseIn] = useState(0); // seconds countdown

  const expectedCaptcha = useMemo(() => String(problem.answer), [problem]);

  const closeTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const toastRef = useRef(null);

  // ESC closes (but not while sending)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !isSending) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, isSending]);

  // cleanup timers
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (toastRef.current) clearTimeout(toastRef.current);
    };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(""), 2600);
  };

  const validateAll = () => {
    const next = { reason: "", details: "", captcha: "", email: "" };

    if (!reason) next.reason = "Моля, изберете причина.";

    const d = details.trim();
    if (!d) next.details = "Моля, опишете проблема.";
    else if (d.length < 10) next.details = "Опиши поне 10 символа.";
    else if (d.length > 500) next.details = "Максимум 500 символа.";

    const c = captcha.trim();
    if (!c) next.captcha = "Моля, реши задачата.";
    else if (!/^\d+$/.test(c)) next.captcha = "Само цифри.";
    else if (c !== expectedCaptcha) next.captcha = "Грешен отговор.";

    const em = email.trim();
    if (em && !isValidEmail(em)) next.email = "Невалиден имейл адрес.";

    setFieldErrors(next);

    const ok = !Object.values(next).some(Boolean);
    setFormError(ok ? "" : "Моля, поправи маркираните полета.");
    return ok;
  };

  const startAutoClose = () => {
    // close after 4 seconds, show countdown 4..1
    setCloseIn(4);

    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCloseIn((s) => {
        if (s <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      onClose();
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSending || success) return;

    if (!validateAll()) return;

    setIsSending(true);
    setFormError("");

    try {
      await sendReport({
        reason,
        details: details.trim(),
        email: email.trim() || null,
        jobId: jobId ?? null,
        pageUrl: window.location.href,
      });

      setSuccess(true);
      showToast("Сигналът е изпратен успешно.");
      startAutoClose();
    } catch (err) {
      // try to pull meaningful message
      const msg =
        (typeof err?.payload === "string" && err.payload) ||
        err?.payload?.message ||
        err?.payload?.title ||
        err?.message ||
        "Не успяхме да изпратим сигнала. Опитайте отново.";

      setFormError(msg);
      showToast("Грешка при изпращане.");
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const stopClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    closeTimerRef.current = null;
    countdownRef.current = null;
    setCloseIn(0);
  };

  return (
    <div
      className="report-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSending) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="report-modal" onMouseDown={(e) => e.stopPropagation()}>
        {/* Toast */}
        {toast && (
          <div className="report-toast" role="status" aria-live="polite">
            {toast}
          </div>
        )}

        <div className="report-header">
          <h3>Съобщи за проблем с обявата</h3>
          <button
            type="button"
            className="report-close"
            onClick={() => {
              if (isSending) return;
              onClose();
            }}
            aria-label="Close"
            title={isSending ? "Изпраща се..." : "Затвори"}
            disabled={isSending}
          >
            ×
          </button>
        </div>

        {/* Success panel */}
        {success ? (
          <div className="report-success">
            <div className="report-success-badge" aria-hidden="true">✓</div>
            <div className="report-success-title">Изпратено!</div>
            <div className="report-success-text">
              Благодарим ти. Сигналът беше изпратен към екипа ни.
            </div>

            <div className="report-success-meta">
              {closeIn > 0 ? (
                <span>
                  Затваряне след <b>{closeIn}</b> сек.
                </span>
              ) : (
                <span>Затваряне…</span>
              )}
            </div>

            <div className="report-success-actions">
              <button
                type="button"
                className="report-secondary"
                onClick={() => {
                  stopClose();
                  onClose();
                }}
              >
                Затвори сега
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="report-row">
              <div className="report-field">
                <label>Какво не е наред с обявата?*</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isSending}
                >
                  <option value="">---</option>
                  <option value="incorrect">Некоректна информация</option>
                  <option value="expired">Изтекла обява</option>
                  <option value="spam">Спам</option>
                  <option value="other">Друго</option>
                </select>
                {fieldErrors.reason && <div className="report-error">{fieldErrors.reason}</div>}
              </div>

              <div className="report-field">
                <label>Моля опиши ни, къде е проблемът:*</label>
                <input
                  type="text"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  maxLength={500}
                  disabled={isSending}
                  placeholder="Напр. грешна заплата, грешен адрес, подвеждащо описание…"
                />
                <div className="report-hint">
                  {details.trim().length}/500
                </div>
                {fieldErrors.details && <div className="report-error">{fieldErrors.details}</div>}
              </div>
            </div>

            <div className="report-row">
              <div className="report-field small">
                <label>{problem.text}</label>
                <input
                  type="text"
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  disabled={isSending}
                  inputMode="numeric"
                />
                {fieldErrors.captcha && <div className="report-error">{fieldErrors.captcha}</div>}
              </div>

              <div className="report-field">
                <label>Въведете вашият имейл адрес, ако искате да получите отговор.</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSending}
                  placeholder="email@domain.com"
                />
                {fieldErrors.email && <div className="report-error">{fieldErrors.email}</div>}
              </div>
            </div>

            {formError && <div className="report-error report-error-global">{formError}</div>}

            <button type="submit" className="report-submit" disabled={isSending}>
              <img src={sendIcon} alt="" className="report-submit-icon" />
              {isSending ? "Изпращане..." : "Изпрати"}
              {isSending && <span className="report-spinner" aria-hidden="true" />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}