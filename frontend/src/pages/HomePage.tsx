import { useEffect } from "react";
import { Link } from "react-router-dom";

const SERVICIOS_HOME = [
  {
    titulo: "Alimentos y accesorios",
    texto: "Alimento, juguetes, correas y todo lo necesario para el día a día.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 8h12l1 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L6 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
    ),
  },
  {
    titulo: "Estética",
    texto: "Baño, corte y cuidado de uñas, adaptado a cada raza y tamaño.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z" />
      </svg>
    ),
  },
  {
    titulo: "Veterinaria",
    texto: "Consultas generales, vacunación y desparasitación.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    titulo: "Cuidado preventivo",
    texto: "Seguimiento y recordatorios para mantener a tu mascota siempre sana.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 3v4M16 3v4" />
        <path d="m9 15 2 2 4-4" />
      </svg>
    ),
  },
];

export function HomePage() {
  useEffect(() => {
    const elementos = document.querySelectorAll(".fade-in-section");
    if (elementos.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle("is-visible", entry.isIntersecting);
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
      );

    elementos.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">
      <header className="home-nav">
        <div className="brand-mark">
          <div className="logo-dot">M</div>
          <span>MELO Pets</span>
        </div>
        <nav className="home-nav-links" aria-label="Navegación">
          <a href="#nosotros">Nosotros</a>
          <a href="#servicios">Servicios</a>
          <a href="#contacto">Contacto</a>
        </nav>
        <Link className="btn btn-primary btn-sm" to="/login">
          Iniciar sesión
        </Link>
      </header>

      <section className="home-hero">
        <span className="eyebrow">Tienda y centro de cuidado de mascotas</span>
        <h1>Todo lo que tu mascota necesita, en un solo lugar.</h1>
        <p className="home-hero-sub">
          Alimento, accesorios, estética y atención veterinaria — con un equipo que conoce a cada mascota por su nombre.
        </p>
        <div className="home-hero-actions">
          <Link className="btn btn-primary" to="/login">
            Iniciar sesión
          </Link>
          <a className="btn btn-ghost" href="#servicios">
            Ver servicios
          </a>
        </div>
      </section>

      <section className="home-stats fade-in-section">
        <div className="stat-item">
          <span className="stat-value">8</span>
          <span className="stat-label">años en Panamá</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">500+</span>
          <span className="stat-label">mascotas atendidas</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">4</span>
          <span className="stat-label">especialidades</span>
        </div>
      </section>

      <section className="home-section fade-in-section" id="nosotros">
        <h2>Sobre MELO Pets</h2>
        <p className="home-section-text">
          Desde 2018 acompañamos a las familias panameñas y a sus mascotas, combinando una tienda de productos
          seleccionados con cuidado profesional de estética y salud. Cada visita queda registrada, para que el
          historial de tu mascota esté siempre a la mano.
        </p>
      </section>

      <section className="home-section" id="servicios">
        <h2>Nuestros servicios</h2>
        <div className="service-grid">
          {SERVICIOS_HOME.map((s, idx) => (
            <div
              className="card service-card fade-in-section"
              key={s.titulo}
              style={{ transitionDelay: `${idx * 90}ms` }}
            >
              {s.icon}
              <h3>{s.titulo}</h3>
              <p>{s.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section fade-in-section" id="contacto">
        <h2>Visítanos</h2>
        <div className="contact-grid">
          <div>
            <span className="contact-label">Dirección</span>
            <p>Vía España, Ciudad de Panamá</p>
          </div>
          <div>
            <span className="contact-label">Horario</span>
            <p>Lunes a sábado, 8:00 a.m. – 6:00 p.m.</p>
          </div>
          <div>
            <span className="contact-label">Contacto</span>
            <p>+507 6867-5156 · melopets@melopets.com</p>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="brand-mark">
          <div className="logo-dot">M</div>
          <span>MELO Pets</span>
        </div>
        <p>© 2026 MELO Pets</p>
      </footer>
    </div>
  );
}