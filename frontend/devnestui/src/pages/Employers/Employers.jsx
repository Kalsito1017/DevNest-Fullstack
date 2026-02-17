// src/pages/Employers.jsx
import "./Employers.css";
import circleIcon from "../../assets/circleemployers.png";
import laptopIcon from "../../assets/laptopemployers.png";
import phoneIcon from "../../assets/phoneemployers.png";
import ticketIcon from "../../assets/ticketemployers.png";

export default function Employers() {
  return (
    <main className="employers-page">
      <div className="employers-wrap">
        <header className="employers-hero">
          <h1>За работодатели</h1>
        </header>

        {/* Section 1 – Career profile */}
        <section className="emp-section emp-card">
          <div className="emp-left">
            <div className="emp-kicker">Кариерен профил в DEV.BG</div>
            <h2 className="emp-title">Кариерен профил в DEV.BG</h2>

            <p>
              Секцията с кариерни профили на IT компаниите в България стартира
              през януари 2017 година. Бързо след старта тази секция на сайта ни
              се превърна в начина за IT специалистите в България да открият
              информация за tech компаниите, преди да кандидатстват за работа.
            </p>

            <p>
              Всеки работодател, който наема IT специалисти, може да се свърже с
              нас за създаване на кариерен профил. Предлагаме два варианта на
              кариерни профили – напълно безплатни и premium профили.
            </p>

            <p className="emp-cta">
              За повече информация или за да заявите създаване на профил на
              компания, може да пишете на:{" "}
              <a href="mailto:support@dev.bg">support@dev.bg</a>
            </p>
          </div>

          <div className="emp-right emp-media">
            <img src={laptopIcon} alt="Career profile preview" />
          </div>
        </section>

        {/* Rules + IT Jobs (LEFT is ONE illustration image) */}
        <section className="emp-section emp-split">
          <div className="emp-illus">
            <img
              src={circleIcon}
              alt="Имаме няколко задължителни правила"
              className="emp-illus-img"
            />
          </div>

          <div className="emp-itjobs">
            <div className="emp-title-row">
              <span className="emp-badge" aria-hidden="true">
                <JobsIcon />
              </span>

              <div>
                <h2 className="emp-title">IT обяви</h2>
              </div>
            </div>

            <p>
              DEV.BG е специализиран Job Board за IT обяви. Нашата цел е да
              предоставим най-добрата платформа за IT професионалисти, които
              искат да намерят следващата си работа. Всяка компания, която има
              кариерен профил в сайта на DEV.BG, може да се включи в програмата
              на DEV.BG за безплатни обяви.
            </p>

            <p className="emp-cta">
              За повече информация, <a href="#">вижте тук</a> или пишете на:{" "}
              <a href="mailto:support@dev.bg">support@dev.bg</a>.
            </p>
          </div>
        </section>

        {/* Banner ad */}
        <section className="emp-section emp-card">
          <div className="emp-left">
            <div className="emp-kicker">Банер реклама в DEV.BG</div>
            <h2 className="emp-title">Банер реклама в DEV.BG</h2>

            <p>Аудиторията на DEV.BG е съставена от IT специалисти в България.</p>
            <p>
              Предлагаме няколко банер позиции на нашия сайт, на които можем да
              добавим вашата реклама.
            </p>

            <p className="emp-cta">
              За цени и подробности, може да се свържете с:{" "}
              <a href="mailto:dim@dev.bg">dim@dev.bg</a>
            </p>
          </div>

          <div className="emp-right emp-media">
            <img src={phoneIcon} alt="Banner ad preview" />
          </div>
        </section>

        {/* Events promo */}
        <section className="emp-section emp-split emp-split-reverse">
          <div className="emp-itjobs">
            <div className="emp-kicker">Рекламиране на IT събитие</div>
            <h2 className="emp-title">Рекламиране на IT събитие</h2>

            <p>
              Нашата дейност е свързана с организиране на IT събития и имаме
              добре развита компетенция за популяризиране на IT събития.
            </p>

            <p>
              Ако организирате ваше събитие с IT насоченост и имате нужда от
              съдействие с промотирането му, ще ви разкажем за нашия пакет за
              промотиране на IT събития.
            </p>

            <p className="emp-cta">
              За цени и подробности, може да се свържете с:{" "}
              <a href="mailto:dim@dev.bg">dim@dev.bg</a>
            </p>
          </div>

          <div className="emp-right emp-media emp-media-tilt">
            <img src={ticketIcon} alt="Event promotion visual" />
          </div>
        </section>
      </div>
    </main>
  );
}

function JobsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M7 7h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3Zm0 2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H7Zm2 1h6v2H9v-2Zm0 3h4v2H9v-2Z" />
    </svg>
  );
}