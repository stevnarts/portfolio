"use client";

import { ArrowLeft, ArrowRight, Expand, Grid2X2, Rows2, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import "./projects.css";

const projects = [
  {
    title: "Cyclisme", sport: "Cyclisme", format: "Série d’affiches", position: "50% 47%",
    posters: [
      {
        slug: "tour-de-france", title: "Tour de France — Defeat the King",
        description: "Un trône dans la pénombre, un maillot blanc et un faisceau de lumière. Pour cette affiche de l’édition 2026, j’ai imaginé Tadej Pogačar en roi à détrôner.",
        alt: "Tadej Pogačar en maillot blanc, assis sur un trône sous un faisceau de lumière.",
      },
      {
        slug: "giro-uae", title: "Giro d’Italia — UAE Team Emirates XRG",
        description: "Des portraits en maillot blanc dominent une scène de course. Les colonnes et les nuages roses relient l’équipe au décor du Giro.",
        alt: "Montage de coureurs de l’équipe UAE au milieu de colonnes antiques et de nuages roses.",
      },
      {
        slug: "jan-christen", title: "Giro d’Italia — Jan Christen",
        description: "Trois vues de Jan Christen se détachent sur les montagnes. Du buste au coureur sur son vélo, le changement d’échelle entraîne le regard vers le titre.",
        alt: "Trois portraits de Jan Christen devant des montagnes et un ciel traversé de rose.",
      },
      {
        slug: "tdff-maillot-jaune", title: "Tour de France Femmes — Maillot jaune",
        description: "Le casque jaune et les lunettes miroir émergent d’un halo de lumière. Le mot « Queen » occupe toute la moitié inférieure de l’affiche.",
        alt: "Une cycliste souriante en casque jaune au-dessus du mot Queen, sur un dégradé orange et bleu.",
      },
      {
        slug: "totalenergies", title: "TotalEnergies — Effectif 2026",
        description: "Les coureurs et leurs vélos prennent place dans un paysage aux tons sépia. Le lettrage doré et les ornements encadrent la composition.",
        alt: "Coureurs de TotalEnergies et leurs vélos sous un titre doré, dans un cadre ornemental.",
      },
      {
        slug: "etape-du-tour", title: "SMAL & CO — L’Étape du Tour",
        description: "Les portraits de l’équipe en violet surplombent les panneaux du col du Galibier et du col du Télégraphe sur la route de L’Étape du Tour 2026.",
        alt: "Portraits de l’équipe SMAL & CO en violet au-dessus des panneaux des cols alpins.",
      },
    ],
  },
  {
    title: "Racing Club Chambéry", sport: "Football", format: "Affiche de match", position: "50% 29%",
    posters: [{
      slug: "chambery", title: "Classico villenavais",
      description: "Trois joueurs du RC Chambéry surplombent une arène baignée de lumière dorée. Un aigle, du papier déchiré et des lettres gothiques annoncent ce quatrième tour de Coupe de France face à la Jeunesse Villenavaise.",
      alt: "Affiche du Classico villenavais avec trois joueurs de Chambéry, une arène et un aigle.",
    }],
  },
  {
    title: "Affiches", sport: "Basketball", format: "Affiche de match", position: "50% 41%",
    posters: [{
      slug: "jl-bourg", title: "JL Bourg × Beşiktaş",
      description: "Un joueur de Bourg s’élève, ballon en main. Derrière lui, le mot « Game » se répète en rouge et accompagne le mouvement du dunk.",
      alt: "Un basketteur de la JL Bourg en plein saut devant le mot Game répété en rouge.",
    }],
  },
  {
    title: "Bordeaux Mérignac Volley - Burdis", sport: "Volleyball", format: "Affiche de match", position: "50% 36%",
    posters: [{
      slug: "burdis", title: "Burdis × RC Cannes",
      description: "Pour le déplacement des Burdis à Cannes, j’ai superposé les portraits à deux échelles. Le jaune des maillots traverse le bleu du paysage et ramène le regard vers les joueuses.",
      alt: "Montage de joueuses de volley des Burdis face à un coucher de soleil sur la mer.",
    }],
  },
];

export default function Projects() {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<number | null>(null);
  const [posterIndex, setPosterIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const source = useRef<HTMLAnchorElement>(null);
  const swipeOrigin = useRef<{ x: number; y: number } | null>(null);
  const item = selected === null ? null : projects[selected];
  const poster = item?.posters[posterIndex];
  const posterCount = item?.posters.length ?? 0;

  useEffect(() => {
    if (!item || !dialog.current) return;
    if (!dialog.current.open) dialog.current.showModal();
    document.body.classList.add("viewer-open");
    return () => { document.body.classList.remove("viewer-open"); };
  }, [item]);

  function openProject(event: MouseEvent<HTMLAnchorElement>, index: number) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !dialog.current?.showModal) return;
    event.preventDefault();
    source.current = event.currentTarget;
    setPosterIndex(0);
    setSelected(index);
  }

  function changePoster(direction: number) {
    if (posterCount > 1) setPosterIndex((current) => (current + direction + posterCount) % posterCount);
  }

  return (
    <section id="projets" className="work section-pad" aria-labelledby="work-title">
      <div className="shell">
        <div className="section-heading">
          <div><p className="eyebrow"><i />Travaux sélectionnés</p><h2 id="work-title">Les projets<span>.</span></h2></div>
          <div className="gallery-tools">
            <span className="project-count">{projects.length} projets</span>
            <div className="view-choices" role="group" aria-label="Présentation des projets">
              <button title="Vue en grille" aria-label="Vue en grille" aria-pressed={layout === "grid"} onClick={() => setLayout("grid")}><Grid2X2 size={17} /></button>
              <button title="Vue en liste" aria-label="Vue en liste" aria-pressed={layout === "list"} onClick={() => setLayout("list")}><Rows2 size={18} /></button>
            </div>
          </div>
        </div>
        <div className={`gallery gallery-${layout}`}>
          {projects.map((project, index) => {
            const cover = project.posters[0];
            return (
              <a className="project" key={cover.slug} href={`/images/${cover.slug}.webp`} onClick={(event) => openProject(event, index)} aria-label={`Découvrir le projet ${project.title}`}>
                <div className="work-img">
                  <img loading="lazy" decoding="async" src={`/images/${cover.slug}.webp`} srcSet={`/images/${cover.slug}-small.webp 600w, /images/${cover.slug}.webp 1200w`} sizes={layout === "list" ? "112px" : "(max-width: 680px) 92vw, (max-width: 1500px) 46vw, 660px"} width="1200" height="1500" alt={cover.alt} style={{ objectPosition: project.position }} />
                  <span className="image-type">{project.sport}</span>
                  <span className="image-zoom" aria-hidden="true"><Expand size={18} /></span>
                </div>
                <div className="project-label"><div><p>{project.format}<span className="list-sport"> / {project.sport}</span></p><h3>{project.title}</h3></div><span aria-hidden="true" className="project-plus">+</span></div>
              </a>
            );
          })}
        </div>
      </div>
      <dialog className="project-viewer" ref={dialog} aria-labelledby="viewer-title"
        onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}
        onClose={() => { setSelected(null); source.current?.focus({ preventScroll: true }); }}
        onKeyDown={(event) => {
          if (posterCount > 1 && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
            event.preventDefault();
            changePoster(event.key === "ArrowRight" ? 1 : -1);
          }
        }}>
        {item && poster && <div className="viewer-panel">
          <button type="button" className="viewer-close" aria-label="Fermer le projet" onClick={() => dialog.current?.close()}><X size={20} /></button>
          <div className="viewer-poster poster-stage"
            onTouchStart={(event) => {
              const touch = event.touches[0];
              swipeOrigin.current = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
            }}
            onTouchCancel={() => { swipeOrigin.current = null; }}
            onTouchEnd={(event) => {
              const start = swipeOrigin.current;
              swipeOrigin.current = null;
              if (!start || event.touches.length > 0) return;
              const touch = event.changedTouches[0];
              const dx = touch.clientX - start.x;
              if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(touch.clientY - start.y) * 1.4) changePoster(dx < 0 ? 1 : -1);
            }}>
            <img src={`/images/${poster.slug}.webp`} alt={poster.alt} width="1200" height="1500" />
            {posterCount > 1 && <div className="poster-arrows" role="group" aria-label="Parcourir les affiches du projet">
              <button type="button" aria-label="Affiche précédente" onClick={() => changePoster(-1)}><ArrowLeft size={21} /></button>
              <button type="button" aria-label="Affiche suivante" onClick={() => changePoster(1)}><ArrowRight size={21} /></button>
            </div>}
          </div>
          <div className="viewer-copy">
            <p className="eyebrow"><i />{item.format}</p><h3 id="viewer-title">{item.title}<span>.</span></h3>
            <div aria-live="polite" aria-atomic="true">
              {posterCount > 1 && <p className="poster-index">Affiche {posterIndex + 1} / {posterCount}</p>}
              <p className="viewer-subtitle">{poster.title}</p><p className="viewer-description">{poster.description}</p>
            </div>
          </div>
        </div>}
      </dialog>
    </section>
  );
}
