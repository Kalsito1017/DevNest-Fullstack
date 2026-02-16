// src/pages/Contacts.jsx
import "./Contacts.css";

export default function Contacts() {
  return (
    <main className="contacts-page">
      <div className="contacts-container">
        <header className="contacts-hero">
          <h1>Контакти</h1>
          <p className="contacts-subtitle">
            Свържи се с нас според темата на запитването.
          </p>
        </header>

        <section className="contacts-grid">
          <ContactCard
            title="IT Обяви"
            desc="За запитвания, свързани с публикуване на IT обяви или създаване на кариерен профил на компания, може да се свържете с"
            name="Симона Петрова"
            email="support@devnest.bg"
            phone="+359 876 037 220"
          />

          <ContactCard
            title="Събития"
            desc="За запитвания, свързани със събития, може да се свържете с"
            name="Мария Иванова"
            email="zornitsa@devnest.bg"
            phone="+359 878 46 46 53"
          />

          <ContactCard
            title="Партньорства"
            desc="За запитвания, свързани с партньорства, реклама на сайта и спонсорство на потребителските ни групи, може да се свържете с"
            name="Димитър Георгиев"
            email="dim@devnest.bg"
            phone="+359 878 46 46 73"
          />

          <div className="contact-card contact-card-wide">
            <h2>Други запитвания</h2>
            <p className="contact-desc">За други запитвания пишете ни на:</p>

            <div className="contact-lines">
              <a className="contact-link" href="mailto:support@devnest.bg">
                support@devnest.bg
              </a>
            </div>

            <div className="contact-divider" />

            <h3>Адрес на нашия офис</h3>
            <p className="contact-desc">
              Парк-хотел "Москва", ул. „Незабравка“ № 25, ет.3, София 1113
            </p>

            <div className="contact-map-hint">Office location</div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ContactCard({ title, desc, name, email, phone }) {
  const telHref = `tel:${phone.replace(/\s+/g, "")}`;

  return (
    <div className="contact-card">
      <h2>{title}</h2>
      <p className="contact-desc">{desc}</p>

      <div className="contact-lines">
        <div className="contact-name">{name}</div>

        <a className="contact-link" href={`mailto:${email}`}>
          {email}
        </a>

        <a className="contact-link" href={telHref}>
          {phone}
        </a>
      </div>
    </div>
  );
}