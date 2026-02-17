import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import authService from "../../../services/passwordReset";
import "./ResetPassword.css";

function genPassword(len = 14) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*_-+=?";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (x) => chars[x % chars.length]).join("");
}

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const email = params.get("email") || "";
  const token = params.get("token") || "";

  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    // винаги да предлага random 12+ по default
    setPwd(genPassword(14));
  }, []);

  const isValid = useMemo(() => pwd.length >= 12, [pwd]);

  const onGenerate = () => setPwd(genPassword(14));

  const onSubmit = async () => {
    setErr("");
    setMsg("");

    if (!email || !token) {
      setErr("Липсва линк/токен. Отворете линка от имейла отново.");
      return;
    }
    if (!isValid) {
      setErr("Паролата трябва да е минимум 12 символа.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(email, token, pwd);
      setMsg("Паролата е сменена успешно. Можете да влезете в профила си.");
      // по желание: navigate("/") след 1-2 секунди
    } catch (e) {
      const apiMsg =
        e?.response?.data?.message ||
        (Array.isArray(e?.response?.data?.errors) ? e.response.data.errors.join(", ") : null) ||
        "Грешка при смяна на парола.";
      setErr(apiMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="reset-page">
      <div className="reset-card">
        <div className="reset-brand">DevNest</div>
        <div className="reset-hint">Въведете новата си парола по-долу или генерирайте такава.</div>

        <label className="reset-label">Нова парола</label>
        <div className="reset-inputRow">
          <input
            type={show ? "text" : "password"}
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="reset-input"
          />
          <button type="button" className="reset-eye" onClick={() => setShow((s) => !s)}>
            {show ? "Скрий" : "Покажи"}
          </button>
        </div>

        <div className={`reset-meter ${isValid ? "ok" : ""}`}>
          {isValid ? "Силна" : "Минимум 12 символа"}
        </div>

        <div className="reset-actions">
          <button type="button" className="reset-btn" onClick={onGenerate} disabled={isLoading}>
            Генериране на парола
          </button>
          <button type="button" className="reset-btn primary" onClick={onSubmit} disabled={isLoading}>
            Запазване на парола
          </button>
        </div>

        {err && <div className="reset-error">{err}</div>}
        {msg && (
          <div className="reset-success">
            {msg}{" "}
            <button className="reset-link" onClick={() => navigate("/")}>
              Към началото
            </button>
          </div>
        )}
      </div>
    </main>
  );
}