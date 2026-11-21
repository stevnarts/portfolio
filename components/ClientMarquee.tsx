"use client";

import { Pause, Play } from "lucide-react";
import { useState, type CSSProperties } from "react";
import styles from "./ClientMarquee.module.css";

const clients = [
  { name: "La Kazdalerie", file: "kazdalerie.png", width: "8.1rem", height: "3.9rem" },
  { name: "Paris FC", file: "paris-fc.svg", width: "5.2rem", height: "5.4rem" },
  { name: "US Créteil Lusitanos", file: "creteil.png", width: "5.5rem", height: "5.3rem" },
  { name: "Racing Club Chambéry", file: "chambery.png", width: "5.2rem", height: "5.8rem" },
  { name: "Ligue de Football de Nouvelle-Aquitaine", file: "lfna.png", width: "5.5rem", height: "5.9rem" },
  { name: "BERUGBE", file: "berugbe.png", width: "8.2rem", height: "4.1rem" },
  { name: "Saïd Pieds Carrés", file: "pieds-carres.png", width: "5.7rem", height: "5.7rem" },
];

export default function ClientMarquee() {
  const [paused, setPaused] = useState(false);

  return (
    <div className={styles.marquee}>
      <div className={styles.window}>
        <div className={styles.track} style={{ animationPlayState: paused ? "paused" : "running" }}>
          {[0, 1].map((copy) => (
            <ul key={copy} className={styles.group} aria-label={copy === 0 ? "Clients de Steven" : undefined} aria-hidden={copy === 1 || undefined}>
              {clients.map(({ name, file, width, height }) => (
                <li key={file} className={styles.client} title={name}>
                  <span className={styles.mark} style={{ width, height, "--logo": `url("/clients/${file}")` } as CSSProperties}>
                    <img src={`/clients/${file}`} alt={copy === 0 ? name : ""} draggable={false} />
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <button type="button" className={styles.playback} onClick={() => setPaused(!paused)}
        aria-label={paused ? "Reprendre le défilement des logos" : "Mettre en pause le défilement des logos"}
        title={paused ? "Reprendre le défilement" : "Mettre en pause"}>
        {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
      </button>
    </div>
  );
}
