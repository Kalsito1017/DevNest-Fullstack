import { useNavigate } from "react-router-dom";
import "./EventsEmptyState.css";

export default function EventsEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="events-empty">
      <div className="events-empty-box">
        <div className="events-empty-icon">
          <span>?</span>
        </div>

        <h2 className="events-empty-title">
          Нямате предстоящи събития
        </h2>

        <p className="events-empty-text">
          Все още нямаш регистрация за събития. Разгледай всички предстоящи
          събития и се регистрирай за тези, на които искаш да присъстваш.
        </p>

        <button
          type="button"
          className="events-empty-btn"
          onClick={() => navigate("/events")}
        >
          Виж всички събития на DEV.BG
        </button>
      </div>
    </div>
  );
}
