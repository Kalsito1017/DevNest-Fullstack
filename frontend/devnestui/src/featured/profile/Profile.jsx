import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/api/authService";
import "./Profile.css";

import MyFiles from "../files/MyFiles";
import SavedJobs from "../jobs/SavedJobs";
import SavedEvents from "../events/SavedEvents";
import MyApplications from "../applications/MyApplications";

const ALLOWED_TABS = new Set([
  "profile",
  "files",
  "saved",
  "applications",
  "subscriptions",
  "events",
]);

const Profile = () => {
  const { user, isAuthLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = useMemo(() => {
    const t = (searchParams.get("tab") || "").toLowerCase();
    return ALLOWED_TABS.has(t) ? t : "profile";
  }, [searchParams]);

  const [activeSection, setActiveSection] = useState(tabFromUrl);

  useEffect(() => {
    setActiveSection(tabFromUrl);
  }, [tabFromUrl]);

  const goTab = (tab) => {
    const safe = ALLOWED_TABS.has(tab) ? tab : "profile";
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", safe);
      return next;
    });
  };

  const [personal, setPersonal] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [pwd, setPwd] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;
    setPersonal({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
    });
  }, [user]);

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [activeSection]);

  const initials = useMemo(() => {
    const letter = (
      user?.firstName?.trim()?.[0] ||
      user?.email?.trim()?.[0] ||
      "U"
    ).toUpperCase();
    return letter;
  }, [user]);

  const fullName = useMemo(() => {
    const name = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
    return name || user?.email || "Потребител";
  }, [user]);

  if (isAuthLoading) {
    return (
      <div className="profile-page">
        <div className="profile-shell">
          <div className="profile-loading">Зареждане…</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    await logout();
  };

  const handleSavePersonalData = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const firstName = personal.firstName.trim();
    const lastName = personal.lastName.trim();
    const email = personal.email.trim().toLowerCase();

    if (firstName.length < 2)
      return setError("Името трябва да е поне 2 символа.");
    if (lastName.length < 2)
      return setError("Фамилията трябва да е поне 2 символа.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Невалиден имейл адрес.");

    setSavingPersonal(true);
    try {
      setSuccess("Запазено. (чакаме endpoint за профила)");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          (Array.isArray(err?.response?.data?.errors)
            ? err.response.data.errors.join(", ")
            : null) ||
          "Грешка при запазване.",
      );
    } finally {
      setSavingPersonal(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const currentPassword = pwd.currentPassword;
    const newPassword = pwd.newPassword;

    if (!currentPassword) return setError("Въведи текущата си парола.");
    if (newPassword.length < 6)
      return setError("Паролата трябва да е поне 6 символа.");
    if (newPassword !== pwd.confirmPassword)
      return setError("Паролите не съвпадат.");

    setSavingPwd(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setPwd({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess("Паролата е сменена.");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.errors)
          ? err.response.data.errors.join(", ")
          : null) ||
        "Грешка при смяна на парола.";
      setError(msg);
    } finally {
      setSavingPwd(false);
    }
  };

  const pageTitle =
    activeSection === "files"
      ? "Моите файлове"
      : activeSection === "saved"
        ? "Запазени обяви"
        : activeSection === "applications"
          ? "Моите кандидатури"
          : activeSection === "events"
            ? "Моите събития"
            : "Моят профил";

  const pageSubtitle =
    activeSection === "files"
      ? "Качи CV/портфолио/мотивационно писмо, което да използваш при кандидатстване."
      : activeSection === "saved"
        ? "Всички обяви, които си запазил с 📌."
        : activeSection === "applications"
          ? "Виж всички обяви, за които си кандидатствал."
          : activeSection === "events"
            ? "Всички AI workshops, които си запазил с „Запази ми място“."
            : activeSection === "profile"
              ? "Редактирай информацията за твоя профил"
              : "Секцията е готова като структура. Трябва да добавим endpoint-и и таблици в DB, за да зарежда реални данни.";

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <aside className="profile-sidebar">
          <div className="profile-avatar-block">
            <div className="profile-avatar" aria-hidden="true">
              {initials}
            </div>
            <div className="profile-avatar-meta">
              <div className="profile-name">{fullName}</div>
              <div className="profile-email">{user.email}</div>
            </div>
          </div>

          <div className="profile-menu">
            <div className="profile-menu-group-title">DEV.BG EVENTS</div>
            <button
              className={`profile-menu-item ${activeSection === "events" ? "is-active" : ""}`}
              onClick={() => goTab("events")}
              type="button"
            >
              Моите събития
            </button>

            <div className="profile-menu-group-title">DEV.BG JOBS</div>

            <button
              className={`profile-menu-item ${activeSection === "applications" ? "is-active" : ""}`}
              onClick={() => goTab("applications")}
              type="button"
            >
              Моите кандидатури
            </button>

            <button
              className={`profile-menu-item ${activeSection === "saved" ? "is-active" : ""}`}
              onClick={() => goTab("saved")}
              type="button"
            >
              Запазени обяви
            </button>

            <button
              className={`profile-menu-item ${activeSection === "files" ? "is-active" : ""}`}
              onClick={() => goTab("files")}
              type="button"
            >
              Моите файлове
            </button>

            <div className="profile-menu-divider" />

            <button
              className={`profile-menu-item ${activeSection === "profile" ? "is-active" : ""}`}
              onClick={() => goTab("profile")}
              type="button"
            >
              Моят профил
            </button>

            <button
              className="profile-menu-item danger"
              onClick={handleLogout}
              type="button"
            >
              Изход
            </button>
          </div>
        </aside>

        <main className="profile-main">
          <header className="profile-header">
            <h1>{pageTitle}</h1>
            <p>{pageSubtitle}</p>
          </header>

          {(error || success) && (
            <div
              className={`profile-flash ${error ? "is-error" : "is-success"}`}
            >
              {error || success}
            </div>
          )}

          {activeSection === "profile" && (
            <div className="profile-grid">
              <section className="profile-card">
                <div className="profile-card-title">
                  <h2>Лични данни</h2>
                  <div className="profile-underline" />
                </div>

                <p className="profile-card-hint">
                  Данните, които въведете ще са данните които ще бъдат изпратени
                  към работодателя, когато кандидатствате.
                </p>

                <form
                  onSubmit={handleSavePersonalData}
                  className="profile-form"
                >
                  <label className="profile-label">
                    Име
                    <input
                      className="profile-input"
                      value={personal.firstName}
                      onChange={(e) =>
                        setPersonal((p) => ({
                          ...p,
                          firstName: e.target.value,
                        }))
                      }
                      disabled={savingPersonal}
                    />
                  </label>

                  <label className="profile-label">
                    Фамилия
                    <input
                      className="profile-input"
                      value={personal.lastName}
                      onChange={(e) =>
                        setPersonal((p) => ({ ...p, lastName: e.target.value }))
                      }
                      disabled={savingPersonal}
                    />
                  </label>

                  <label className="profile-label">
                    E-mail
                    <input
                      className="profile-input"
                      value={personal.email}
                      onChange={(e) =>
                        setPersonal((p) => ({ ...p, email: e.target.value }))
                      }
                      disabled={savingPersonal}
                    />
                  </label>

                  <button
                    className="profile-btn"
                    type="submit"
                    disabled={savingPersonal}
                  >
                    {savingPersonal
                      ? "Запазване…"
                      : "Запази промените в личните данни"}
                  </button>
                </form>
              </section>

              <section className="profile-card">
                <div className="profile-card-title">
                  <h2>Смени парола</h2>
                  <div className="profile-underline" />
                </div>

                <form onSubmit={handleChangePassword} className="profile-form">
                  <label className="profile-label">
                    Текуща парола
                    <input
                      type="password"
                      className="profile-input"
                      value={pwd.currentPassword}
                      onChange={(e) =>
                        setPwd((p) => ({
                          ...p,
                          currentPassword: e.target.value,
                        }))
                      }
                      disabled={savingPwd}
                      autoComplete="current-password"
                    />
                  </label>

                  <label className="profile-label">
                    Въведи нова парола
                    <input
                      type="password"
                      className="profile-input"
                      value={pwd.newPassword}
                      onChange={(e) =>
                        setPwd((p) => ({ ...p, newPassword: e.target.value }))
                      }
                      disabled={savingPwd}
                      autoComplete="new-password"
                    />
                  </label>

                  <label className="profile-label">
                    Потвърди новата парола
                    <input
                      type="password"
                      className="profile-input"
                      value={pwd.confirmPassword}
                      onChange={(e) =>
                        setPwd((p) => ({
                          ...p,
                          confirmPassword: e.target.value,
                        }))
                      }
                      disabled={savingPwd}
                      autoComplete="new-password"
                    />
                  </label>

                  <button
                    className="profile-btn"
                    type="submit"
                    disabled={savingPwd}
                  >
                    {savingPwd ? "Запазване…" : "Промени паролата"}
                  </button>
                </form>
              </section>
            </div>
          )}

          {activeSection === "files" && (
            <div style={{ paddingTop: 4 }}>
              <MyFiles />
            </div>
          )}

          {activeSection === "saved" && (
            <div style={{ paddingTop: 4 }}>
              <SavedJobs />
            </div>
          )}

          {activeSection === "applications" && (
            <div style={{ paddingTop: 4 }}>
              <MyApplications />
            </div>
          )}

          {activeSection === "events" && (
            <div style={{ paddingTop: 4 }}>
              <SavedEvents
                onRequireAuth={() => {
                  setError(
                    "Моля, влез в профила си, за да видиш запазените събития.",
                  );
                }}
                onOpenWorkshop={(id, slug) => {
                  navigate(`/workshop/${slug}`, { state: { id } });
                }}
              />
            </div>
          )}

          {activeSection !== "profile" &&
            activeSection !== "files" &&
            activeSection !== "saved" &&
            activeSection !== "applications" &&
            activeSection !== "events" && (
              <section className="profile-card">
                <div className="profile-card-title">
                  <h2>{pageTitle}</h2>
                  <div className="profile-underline" />
                </div>

                <p className="profile-card-hint">
                  Секцията е готова като структура. Трябва да добавим endpoint-и
                  и таблици в DB, за да зарежда реални данни.
                </p>

                <div className="profile-empty">Няма данни за показване.</div>
              </section>
            )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
