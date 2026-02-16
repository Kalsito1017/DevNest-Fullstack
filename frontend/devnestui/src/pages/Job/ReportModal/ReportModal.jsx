import { useEffect, useMemo, useState } from "react";
import "./ReportModal.css";
import sendIcon from "../../../assets/samoletche.jpg";

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function generateMathProblem(maxAnswer = 100) {
  const op = Math.random() < 0.5 ? "+" : "-";

  if (op === "+") {
    const a = Math.floor(Math.random() * (maxAnswer + 1));      // 0..100
    const b = Math.floor(Math.random() * (maxAnswer - a + 1));  // 0..(100-a)
    return { text: `${a} + ${b} =`, answer: a + b };
  }

  const a = Math.floor(Math.random() * (maxAnswer + 1)); // 0..100
  const b = Math.floor(Math.random() * (a + 1));         // 0..a
  return { text: `${a} - ${b} =`, answer: a - b };
}

export default function ReportModal({ onClose }) {
  // ✅ new problem on every open (because component remounts)
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

  const expectedCaptcha = useMemo(() => String(problem.answer), [problem]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    console.log({
      reason,
      details: details.trim(),
      email: email.trim() || null,
    });

    onClose();
  };

  return (
   <div
  className="report-backdrop"
  onMouseDown={(e) => {
    if (e.target === e.currentTarget) onClose();
  }}
  role="dialog"
  aria-modal="true"
>
      <div className="report-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="report-header">
          <h3>Съобщи за проблем с обявата</h3>
          <button type="button" className="report-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="report-row">
            <div className="report-field">
              <label>Какво не е наред с обявата?*</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)}>
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
              />
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
              />
              {fieldErrors.captcha && <div className="report-error">{fieldErrors.captcha}</div>}
            </div>

            <div className="report-field">
              <label>Въведете вашият имейл адрес, ако искате да получите отговор.</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {fieldErrors.email && <div className="report-error">{fieldErrors.email}</div>}
            </div>
          </div>

          {formError && <div className="report-error report-error-global">{formError}</div>}

          <button type="submit" className="report-submit">
            <img src={sendIcon} alt="" className="report-submit-icon" />
            Изпрати
          </button>
        </form>
      </div>
    </div>
  );
}