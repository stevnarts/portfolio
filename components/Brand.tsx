import { Asterisk } from "./StudioAccents";

export { Asterisk };

export function Brand() {
  return <span className="brand studio-wordmark">
    <Asterisk label="Faire tourner l’étoile Stevnarts" />
    <a href="#accueil" aria-label="Stevnarts, accueil">stevnarts<span className="brand-stop">.</span></a>
  </span>;
}
