"use client";

import { Grid2X2, Rows2, Expand, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const projects = [
  {
    slug: "tour-de-france", title: "Tour de France", subtitle: "Defeat the King", sport: "Cyclisme", format: "Key visual",
    description: "Un trône dans la pénombre, un maillot blanc et un faisceau de lumière. Pour cette affiche de l’édition 2026, j’ai imaginé Tadej Pogačar en roi à détrôner.",
    alt: "Tadej Pogačar en maillot blanc, assis sur un trône sous un faisceau de lumière.", position: "50% 47%",
  },
  {
    slug: "chambery", title: "Classico villenavais", subtitle: "RC Chambéry × Jeunesse Villenavaise", sport: "Football", format: "Affiche de match",
    description: "Trois joueurs du RC Chambéry surplombent une arène baignée de lumière dorée. Un aigle, du papier déchiré et des lettres gothiques annoncent ce quatrième tour de Coupe de France.",
    alt: "Affiche du Classico villenavais avec trois joueurs de Chambéry, une arène et un aigle.", position: "50% 29%",
  },
  {
    slug: "jl-bourg", title: "JL Bourg × Beşiktaş", subtitle: "Soir d’EuroCup", sport: "Basketball", format: "Affiche de match",
    description: "Un joueur de Bourg s’élève, ballon en main. Derrière lui, le mot « Game » se répète en rouge et accompagne le mouvement du dunk.",
    alt: "Un basketteur de la JL Bourg en plein saut devant le mot Game répété en rouge.", position: "50% 41%",
  },
  {
    slug: "burdis", title: "Burdis × RC Cannes", subtitle: "Gameday", sport: "Volleyball", format: "Affiche de match",
    description: "Pour le déplacement des Burdis à Cannes, j’ai superposé les portraits à deux échelles. Le jaune des maillots traverse le bleu du paysage et ramène le regard vers les joueuses.",
    alt: "Montage de joueuses de volley des Burdis face à un coucher de soleil sur la mer.", position: "50% 36%",
  },
];

export default function Projects() {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const source = useRef<HTMLAnchorElement>(null);
  const item = selected === null ? null : projects[selected];

  useEffect(() => {
    if (selected !== null && dialog.current && !dialog.current.open) {
      dialog.current.showModal();
      document.body.classList.add("viewer-open");
    }
  }, [selected]);

  useEffect(() => {
    const element = dialog.current;
    function afterClose() {
      document.body.classList.remove("viewer-open");
      setSelected(null);
      source.current?.focus({ preventScroll: true });
    }
    element?.addEventListener("close", afterClose);
    return () => {
      element?.removeEventListener("close", afterClose);
      document.body.classList.remove("viewer-open");
    };
  }, []);

  function openProject(event: React.MouseEvent<HTMLAnchorElement>, index: number) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !dialog.current?.showModal) return;
    event.preventDefault();
    source.current = event.currentTarget;
    setSelected(index);
  }
  function changeProject(direction: number) {
    setSelected((current) => current === null ? null : (current + direction + projects.length) % projects.length);
  }

  return (
    <section id="projets" className="work section-pad" aria-labelledby="work-title">
      <div className="shell">
        <div className="section-heading">
          <div><p className="eyebrow"><i />Travaux sélectionnés</p><h2 id="work-title">Les projets<span>.</span></h2></div>
          <div className="gallery-tools">
            <span className="project-count">4 projets</span>
            <div className="view-choices" role="group" aria-label="Présentation des projets">
              <button title="Vue en grille" aria-label="Vue en grille" aria-pressed={layout === "grid"} onClick={() => setLayout("grid")}><Grid2X2 size={17} /></button>
              <button title="Vue en liste" aria-label="Vue en liste" aria-pressed={layout === "list"} onClick={() => setLayout("list")}><Rows2 size={18} /></button>
            </div>
          </div>
        </div>
        <div className={`gallery gallery-${layout}`}>
          {projects.map((project, index) => (
            <a className="project" key={project.slug} href={`/images/${project.slug}.webp`} onClick={(event) => openProject(event, index)} aria-label={`Découvrir le projet ${project.title}`}>
              <div className="work-img">
                <img loading="lazy" decoding="async" src={`/images/${project.slug}.webp`} srcSet={`/images/${project.slug}-small.webp 600w, /images/${project.slug}.webp 1200w`} sizes={layout === "list" ? "112px" : "(max-width: 680px) 92vw, (max-width: 1500px) 46vw, 660px"} width="1200" height="1500" alt={project.alt} style={{ objectPosition: project.position }} />
                <span className="image-type">{project.sport}</span>
                <span className="image-zoom" aria-hidden="true"><Expand size={18} /></span>
              </div>
              <div className="project-label"><div><p>{project.format}<span className="list-sport"> / {project.sport}</span></p><h3>{project.title}</h3></div><span aria-hidden="true" className="project-plus">+</span></div>
            </a>
          ))}
        </div>
      </div>
      <dialog className="project-viewer" ref={dialog} aria-labelledby="viewer-title"
        onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); changeProject(event.key === "ArrowRight" ? 1 : -1); }
        }}>
        {selected !== null && item && <div className="viewer-panel">
          <button type="button" className="viewer-close" aria-label="Fermer le projet" onClick={() => dialog.current?.close()}><X size={20} /></button>
          <div className="viewer-poster"><img loading="lazy" src={`/images/${item.slug}.webp`} alt={item.alt} width="1200" height="1500" /></div>
          <div className="viewer-copy" aria-live="polite" aria-atomic="true">
            <p className="eyebrow"><i />{item.sport}</p><h3 id="viewer-title">{item.title}<span>.</span></h3>
            <p className="viewer-subtitle">{item.subtitle}</p><p className="viewer-description">{item.description}</p>
            <div className="viewer-pager"><button onClick={() => changeProject(-1)}>Précédent</button><span>{selected + 1} / {projects.length}</span><button onClick={() => changeProject(1)}>Suivant</button></div>
          </div>
        </div>}
      </dialog>
    </section>
  );
}
