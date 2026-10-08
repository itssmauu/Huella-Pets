import { useRef } from "react";
import { Link } from "react-router-dom";
import { PhotoStack } from "../components/home/PhotoStack";
import { InkText, CountUp } from "../components/home/ScrollBits";
import { ServiceList } from "../components/home/ServiceList";
import { OpenStatus } from "../components/home/OpenStatus";
import { PawIcon } from "../components/home/icons";
import { useReveal, useScrolled } from "../hooks/useReveal";

const CINTA = [
  "Baño y secado",
  "Corte por raza",
  "Vacunación",
  "Alimento premium",
  "Desparasitación",
  "Juguetes y correas",
  "Consulta general",
  "Corte de uñas",
];

const TITULO = ["Aquí conocemos", "a tu mascota", "por su nombre."];

const NOSOTROS =
  "Desde 2018 acompañamos a familias panameñas y a sus mascotas. Somos tienda, peluquería y consultorio en un mismo lugar, y cada visita queda registrada para que el historial de tu mascota esté siempre a la mano.";

const MAPA = "https://www.google.com/maps/search/?api=1&query=V%C3%ADa+Espa%C3%B1a%2C+Ciudad+de+Panam%C3%A1";

function Marca() {
  return (
    <Link className="brand-mark" to="/" aria-label="MELO Pets, inicio">
      <div className="logo-dot">
        <img src="/MELOPets_logo.png" alt="" />
      </div>
      <span>MELO Pets</span>
    </Link>
  );
}

export function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const scrolled = useScrolled(24);
  useReveal(pageRef);

  return (
    <div className="home-page" ref={pageRef}>
      <header className="home-nav" data-scrolled={scrolled}>
        <Marca />
        <nav className="home-nav-links" aria-label="Secciones">
          <a href="#nosotros">Nosotros</a>
          <a href="#servicios">Servicios</a>
          <a href="#contacto">Visítanos</a>
        </nav>
        <Link className="btn btn-primary btn-sm" to="/login">
          <span>
            Acceso<span className="only-wide"> del personal</span>
          </span>
        </Link>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <h1 className="hero-title">
              {TITULO.map((linea, i) => (
                <span className="line" key={linea}>
                  <span style={{ ["--i" as string]: i }}>{linea}</span>
                </span>
              ))}
            </h1>
            <p className="hero-sub hero-fade" style={{ ["--d" as string]: "520ms" }}>
              Alimento, accesorios, estética y veterinaria en Vía España, con un equipo que recuerda si a Bruno le
              asusta la secadora.
            </p>
            <div className="hero-actions hero-fade" style={{ ["--d" as string]: "640ms" }}>
              <a className="btn btn-primary btn-lg" href="#servicios">
                Ver servicios
              </a>
              <a className="btn btn-ghost btn-lg" href="#contacto">
                Cómo llegar
              </a>
            </div>
            <div className="hero-fade" style={{ ["--d" as string]: "760ms" }}>
              <OpenStatus />
            </div>
          </div>

          <PhotoStack />
        </section>

        <div className="marquee" aria-label="Servicios: baño, corte, vacunación, alimento, desparasitación, accesorios, consulta y uñas">
          <div className="marquee-track" aria-hidden="true">
            {[0, 1].map((g) => (
              <div className="marquee-group" key={g}>
                {CINTA.map((t) => (
                  <span className="marquee-item" key={t}>
                    {t}
                    <PawIcon />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <section className="section about" id="nosotros">
          <InkText text={NOSOTROS} />
          <div className="stats">
            <div className="stat" data-reveal>
              <CountUp to={8} />
              <span className="stat-label">años en Panamá</span>
            </div>
            <div className="stat" data-reveal style={{ ["--reveal-delay" as string]: 100 }}>
              <CountUp to={500} suffix="+" />
              <span className="stat-label">mascotas con historial</span>
            </div>
            <div className="stat" data-reveal style={{ ["--reveal-delay" as string]: 200 }}>
              <CountUp to={4} />
              <span className="stat-label">especialidades bajo un techo</span>
            </div>
          </div>
        </section>

        <section className="section" id="servicios">
          <div className="section-head">
            <h2 className="section-title" data-reveal>
              Lo que hacemos por tu mascota
            </h2>
            <p className="section-lede" data-reveal style={{ ["--reveal-delay" as string]: 120 }}>
              Puedes venir por una bolsa de alimento y salir con las uñas cortadas. Todo queda en el mismo historial.
            </p>
          </div>
          <ServiceList />
        </section>

        <section className="section" id="contacto">
          <div className="visit" data-reveal>
            <figure className="visit-photo" aria-hidden="true">
              <img
                src="https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=520&h=600&q=75"
                alt=""
                loading="lazy"
              />
              <figcaption>Nala te saluda</figcaption>
            </figure>
            <h2 className="section-title">Pasa a saludarnos</h2>
            <OpenStatus />
            <div className="visit-grid">
              <div>
                <h3>Dirección</h3>
                <p>Vía España, Ciudad de Panamá</p>
              </div>
              <div>
                <h3>Horario</h3>
                <p>
                  Lunes a sábado
                  <br />
                  8:00 a.m. a 6:00 p.m.
                </p>
              </div>
              <div>
                <h3>Contacto</h3>
                <p>
                  <a href="tel:+50768675156">+507 6867-5156</a>
                  <br />
                  <a href="mailto:melopets@melopets.com">melopets@melopets.com</a>
                </p>
              </div>
            </div>
            <div className="visit-actions">
              <a className="btn btn-accent btn-lg" href={MAPA} target="_blank" rel="noreferrer">
                Abrir en Google Maps
              </a>
              <a className="btn btn-ghost btn-lg" href="https://wa.me/50768675156" target="_blank" rel="noreferrer">
                Escribir por WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <Marca />
        <p>© 2026 MELO Pets, Ciudad de Panamá</p>
        <Link to="/login">Acceso del personal</Link>
      </footer>
    </div>
  );
}
