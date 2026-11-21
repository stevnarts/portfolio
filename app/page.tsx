import { CalendarDays } from "lucide-react";
import { Asterisk, Brand } from "../components/Brand";
import { StudioCoin, StarField } from "../components/StudioAccents";
import ClientMarquee from "../components/ClientMarquee";
import Contact from "../components/Contact";
import Navigation from "../components/Navigation";
import Projects from "../components/Projects";
import { Preloader, StudioOrbit } from "../components/PortfolioMotion";

export default function Portfolio() {
  return (
    <>
      <Preloader />
      <a className="skip-link" href="#projets">Aller aux projets</a>
      <Navigation />
      <main>
        <section className="hero" id="accueil" aria-labelledby="hero-title">
          <StarField />
          <div className="shell hero-inner">
            <div className="hero-copy">
              <p className="eyebrow hero-byline"><i />Steven Roumilhac <b>/</b> Portfolio 2026</p>
              <h1 id="hero-title">
                <span>Graphiste <em>&amp;</em></span>
                <span>directeur</span>
                <span>artistique<span className="gold">.</span></span>
              </h1>
              <p className="intro-text">Moi, c’est Steven, jeune étudiant mais également freelance en tant que graphiste et DA. J’accompagne entreprises, PME, associations, athlètes et autres pour leur identité visuelle.</p>
              <div className="hero-actions">
                <a className="primary-action" href="#contact"><CalendarDays size={16} strokeWidth={1.8} />Prenons RDV</a>
                <a className="text-action" href="#projets">Mes projets</a>
              </div>
            </div>
            <div className="portrait-stage">
              <span className="stage-ring ring-one" aria-hidden="true" /><span className="stage-ring ring-two" aria-hidden="true" />
              <span className="crosshair cross-top" aria-hidden="true" /><span className="crosshair cross-bottom" aria-hidden="true" />
              <figure className="photo-print">
                <span className="photo-tape" aria-hidden="true" />
                <div className="portrait-window"><img fetchPriority="high" loading="eager" src="/images/steven.webp" alt="Steven Roumilhac, graphiste et directeur artistique, photographié de trois quarts." width="720" height="900" /></div>
                <figcaption><span className="photo-signature" aria-hidden="true">Steven.</span><span className="photo-bars" aria-hidden="true" /></figcaption>
                <StudioCoin />
              </figure>
            </div>
          </div>
        </section>
        <Projects />
        <section id="profil" className="profile section-pad" aria-labelledby="profile-title">
          <StarField />
          <div className="shell profile-layout">
            <div className="profile-heading"><p className="eyebrow"><i />À propos</p><h2 id="profile-title">Derrière<br />les visuels</h2><StudioOrbit /></div>
            <div className="profile-text">
              <p className="profile-lead">Je suis <strong>Steven Roumilhac</strong>, graphiste et directeur artistique junior.</p>
              <p>Depuis deux ans, je travaille en freelance en parallèle de mes études. Quand je crée une identité, je pars de ce qui rend une entreprise, une équipe ou une personne reconnaissable.</p>
              <p>Je donne une direction aux images en travaillant la typographie, les couleurs et la composition. D’un logo à une campagne, je cherche le détail qui relie les supports et donne à chaque projet son caractère.</p>
            </div>
          </div>
        </section>
        <section id="clients" className="clients section-pad" aria-labelledby="clients-title">
          <div className="shell"><p className="eyebrow"><i />Collaborations</p><h2 id="clients-title">Mes clients<span>.</span></h2></div>
          <ClientMarquee />
        </section>
        <section id="contact" className="contact section-pad" aria-labelledby="contact-title">
          <StarField />
          <Contact decoration={<div className="contact-mark"><Asterisk label="Faire tourner l’étoile du studio" /></div>} />
        </section>
      </main>
      <footer><div className="shell footer-inner"><Brand /><p>© 2026 Steven Roumilhac</p><a href="#accueil" className="back-top">Retour en haut</a></div></footer>
    </>
  );
}
