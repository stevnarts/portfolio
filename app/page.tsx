import { Grid2X2, Mail } from "lucide-react";
import { Asterisk, Brand } from "../components/Brand";
import Navigation from "../components/Navigation";
import Projects from "../components/Projects";
import { Preloader, StudioOrbit } from "../components/PortfolioMotion";

const clients = [
  "Ligue de Football de Nouvelle-Aquitaine", "Paris FC", "AS Monaco", "La Kazdalerie", "Olympique Lyonnais",
];
const email = "roumilhac.steven@gmail.com";

function StudioSeal() {
  return (
    <div className="studio-seal" aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <defs><path id="seal-lettering" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" /></defs>
        <circle cx="60" cy="60" r="57.5" className="seal-rim" />
        <circle cx="60" cy="60" r="37" className="seal-rim inner-rim" />
        <text><textPath href="#seal-lettering" textLength="281" lengthAdjust="spacing">STEVNARTS • DIRECTION ARTISTIQUE • </textPath></text>
      </svg>
      <Asterisk />
    </div>
  );
}

export default function Portfolio() {
  return (
    <>
      <Preloader />
      <a className="skip-link" href="#projets">Aller aux projets</a>
      <Navigation />
      <main>
        <section className="hero" id="accueil" aria-labelledby="hero-title">
          <div className="shell hero-inner">
            <div className="hero-copy">
              <p className="eyebrow hero-byline"><i />Steven Roumilhac <b>/</b> Portfolio 2026</p>
              <h1 id="hero-title">
                <span>Graphiste <em>&amp;</em></span>
                <span>directeur</span>
                <span>artistique<span className="gold">.</span></span>
              </h1>
              <p className="intro-text">Moi, c’est Steven. Entre études et projets freelance,<br className="desktop-break" /> je crée des affiches qui racontent le sport.</p>
              <div className="hero-actions">
                <a className="primary-action" href="#projets"><Grid2X2 size={16} strokeWidth={1.8} />Voir mes projets</a>
                <a className="text-action" href="#profil">À propos de moi</a>
              </div>
            </div>
            <div className="portrait-stage">
              <span className="stage-ring ring-one" aria-hidden="true" /><span className="stage-ring ring-two" aria-hidden="true" />
              <span className="crosshair cross-top" aria-hidden="true" /><span className="crosshair cross-bottom" aria-hidden="true" />
              <figure className="photo-print">
                <span className="photo-tape" aria-hidden="true" />
                <div className="portrait-window"><img fetchPriority="high" loading="eager" src="/images/steven.webp" alt="Steven Roumilhac, graphiste et directeur artistique, photographié de trois quarts." width="720" height="900" /></div>
                <figcaption><span className="photo-signature" aria-hidden="true">Steven.</span><span className="photo-bars" aria-hidden="true" /></figcaption>
                <StudioSeal />
              </figure>
            </div>
          </div>
        </section>
        <Projects />
        <section id="profil" className="profile section-pad" aria-labelledby="profile-title">
          <div className="shell profile-layout">
            <div className="profile-heading"><p className="eyebrow"><i />À propos</p><h2 id="profile-title">Derrière<br />l’affiche<span>.</span></h2><StudioOrbit /></div>
            <div className="profile-text">
              <p className="profile-lead">Je suis <strong>Steven Roumilhac</strong>, graphiste et directeur artistique junior.</p>
              <p>Depuis deux ans, je travaille en freelance en parallèle de mes études. Ce qui m’intéresse dans une affiche de sport, c’est tout ce qu’elle peut raconter avant même le début du match.</p>
              <p>Dans mes affiches, un regard peut prendre toute la place. Je joue avec l’échelle des portraits, la lumière et la couleur des maillots pour mettre les athlètes au premier plan.</p>
            </div>
          </div>
        </section>
        <section id="clients" className="clients section-pad" aria-labelledby="clients-title">
          <div className="shell client-layout">
            <div><p className="eyebrow"><i />Collaborations</p><h2 id="clients-title">Mes clients<span>.</span></h2></div>
            <ul className="client-list">{clients.map((client) => <li key={client}><span>{client}</span><Asterisk /></li>)}</ul>
          </div>
        </section>
        <section id="contact" className="contact section-pad" aria-labelledby="contact-title">
          <div className="shell contact-inner">
            <div className="contact-content"><p className="eyebrow"><i />Contact</p><h2 id="contact-title">Parlons de<br />votre projet<span>.</span></h2>
            <a className="email" href={`mailto:${email}`}><Mail size={21} strokeWidth={1.5} />{email}</a></div>
            <div className="contact-mark" aria-hidden="true"><Asterisk /></div>
          </div>
        </section>
      </main>
      <footer><div className="shell footer-inner"><Brand /><p>© 2026 Steven Roumilhac</p><a href="#accueil" className="back-top">Retour en haut</a></div></footer>
    </>
  );
}
