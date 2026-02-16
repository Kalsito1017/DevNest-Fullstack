import "./Cookies.css";

export default function Cookies() {
  return (
    <main className="cookies-page">
      <div className="cookies-container">
        <h1>Политика за използване на бисквитки</h1>
        <p className="cookies-date">
          Последна актуализация: 25.02.2021 г.
        </p>

        <section>
          <p>
            Ние, от DevNest.BG, използваме бисквитки, за да може https://dev.bg/
            да работи ефективно, услугите и съдържанието на сайта да са такива,
            каквито очаквате, а и за да можем с ваша помощ да ги подобряваме
            занапред.
          </p>
        </section>

        <section>
          <h2>Какво са бисквитките</h2>
          <p>
            Бисквитките (cookies) са малки текстови файлове, които се
            съхраняват на вашето устройство, когато посещавате нашия сайт.
          </p>
        </section>

        <section>
          <h2>Строго необходими бисквитки</h2>

          <CookieTable
            data={[
              ["CookieConsent", "dev.bg", "1 година"],
              ["PHPSESSID", "dev.bg", "Постоянна"],
              ["#-visitorId", "typeform.com", "Постоянна"],
              ["attribution_user_id", "typeform.com", "1 година"],
              ["wordpress_*", "wordpress", "6 месеца"],
              ["wordpress_logged_in_*", "wordpress", "Сесийна"],
              ["wordpress_test_cookie", "wordpress", "Сесийна"],
            ]}
          />
        </section>

        <section>
          <h2>Бисквитки, свързани с представянето на сайта</h2>

          <CookieTable
            data={[
              ["_ga", "dev.bg", "2 години"],
              ["_gid", "dev.bg", "1 ден"],
              ["_hjid", "dev.bg", "1 година"],
              ["collect", "google-analytics.com", "Сесийна"],
              ["bcookie", "linkedin.com", "2 години"],
              ["VISITOR_INFO1_LIVE", "youtube.com", "179 дни"],
            ]}
          />
        </section>

        <section>
          <h2>Функционални бисквитки</h2>

          <CookieTable
            data={[
              ["YSC", "youtube.com", "Сесийна"],
              ["yt-remote-session-app", "youtube.com", "Сесийна"],
              ["yt-remote-session-name", "youtube.com", "Сесийна"],
            ]}
          />
        </section>

        <section>
          <h2>Маркетингови бисквитки</h2>

          <CookieTable
            data={[
              ["lang", "dev.bg", "3 месеца"],
              ["_fbp", "dev.bg", "3 месеца"],
              ["IDE", "doubleclick.net", "Сесийна"],
              ["test_cookie", "facebook.com", "3 месеца"],
              ["UserMatchHistory", "ads.linkedin.com", "Сесийна"],
            ]}
          />
        </section>

        <section>
          <h2>Според валидността</h2>
          <p>
            Сесийни бисквитки се изтриват при затваряне на браузъра.
            Постоянните бисквитки остават за определен период.
          </p>
        </section>

        <section>
          <h2>Лични данни</h2>
          <p>
            Ние не използваме бисквитки с цел събиране и обработване на
            вашите лични данни.
          </p>
        </section>

        <section>
          <h2>Управление на бисквитки</h2>
          <p>
            Повечето браузъри позволяват да преглеждате, управлявате,
            изтривате и блокирате бисквитки.
          </p>

          <ul>
            <li>Google Chrome</li>
            <li>Mozilla Firefox</li>
            <li>MacOS Safari</li>
            <li>Microsoft Internet Explorer</li>
          </ul>
        </section>

        <section>
          <h2>Актуализация и промени</h2>
          <p>
            Възможно е периодично да актуализираме настоящата Политика.
            При въпроси: me@devnest.bg
          </p>
        </section>
      </div>
    </main>
  );
}

function CookieTable({ data }) {
  return (
    <div className="cookie-table-wrapper">
      <table className="cookie-table">
        <thead>
          <tr>
            <th>Бисквитка</th>
            <th>Домейн</th>
            <th>Валидност</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{row[0]}</td>
              <td>{row[1]}</td>
              <td>{row[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}