"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Asterisk } from "./Brand";
import { journey } from "./solar-journey";
import "./solar-preloader.css";

const SolarScene = dynamic(() => import("./SolarScene"), { ssr: false });
const introduction = [
  "Bienvenue.",
  "Avant de découvrir mon travail,",
  "J’ai quelques anecdotes à vous partager",
  "Sur l’astronomie et l’art en général.",
  "C’est bon,",
  "Vous pouvez scroller.",
] as const;
const last = introduction.length + journey.length - 1;
const stepNumber = (index: number) => String(index + 1).padStart(2, "0");

export default function Preloader() {
  const dialog = useRef<HTMLDialogElement>(null);
  const earthButton = useRef<HTMLButtonElement>(null);
  const [frame, setFrame] = useState(0);
  const [closing, setClosing] = useState(false);
  const [closed, setClosed] = useState(false);
  const reduced = !!useReducedMotion();
  const step = frame - introduction.length;
  const final = frame === last;
  const stop = step >= 0 ? journey[step] : null;

  useEffect(() => {
    const el = dialog.current;
    if (!el || closed) return;
    el.close();
    el.showModal();
    el.focus({ preventScroll: true });
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    let distance = 0;
    let lastWheel = -Infinity;
    let stepped = false;
    let wheelDirection = 0;
    let lastMove = 0;
    let touch: { x: number; y: number } | null = null;
    function move(by: number) {
      setFrame(previous => Math.max(0, Math.min(last, previous + by)));
    }
    function wheel(event: WheelEvent) {
      if (event.ctrlKey) return;
      const panel = event.target instanceof Element ? event.target.closest(".solar-copy") : null;
      if (panel && panel.scrollHeight > panel.clientHeight + 1) {
        if (event.deltaY > 0 && Math.ceil(panel.scrollTop + panel.clientHeight) < panel.scrollHeight) return;
        if (event.deltaY < 0 && panel.scrollTop > 0) return;
      }
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (!delta) return;
      const now = performance.now();
      if (now - lastWheel > 150 || Math.sign(delta) !== wheelDirection || (stepped && now - lastMove > 720 && Math.abs(delta) >= 24)) {
        distance = 0;
        stepped = false;
      }
      lastWheel = now;
      wheelDirection = Math.sign(delta);
      distance += delta;
      if (!stepped && Math.abs(distance) >= 12) {
        stepped = true;
        lastMove = now;
        move(wheelDirection);
      }
    }
    function start(event: TouchEvent) {
      if (event.target instanceof Element && event.target.closest(".studio-turntable")) { touch = null; return; }
      const panel = event.target instanceof Element ? event.target.closest(".solar-copy") : null;
      if (panel && panel.scrollHeight > panel.clientHeight + 1) { touch = null; return; }
      const point = event.touches[0];
      touch = event.touches.length === 1 ? { x: point.clientX, y: point.clientY } : null;
    }
    function cancel() { touch = null; }
    function end(event: TouchEvent) {
      if (!touch || event.touches.length) return;
      const dx = touch.x - event.changedTouches[0].clientX;
      const dy = touch.y - event.changedTouches[0].clientY;
      touch = null;
      if (Math.abs(dy) > 35 && Math.abs(dy) > Math.abs(dx)) move(Math.sign(dy));
    }
    function key(event: KeyboardEvent) {
      if (event.altKey || event.metaKey || event.ctrlKey || event.repeat) return;
      if (event.target instanceof Element && event.target.closest(".studio-turntable") && (event.key.startsWith("Arrow") || event.key === "Home")) return;
      switch (event.key) {
        case "ArrowRight": case "ArrowDown": case "PageDown": move(1); break;
        case "ArrowLeft": case "ArrowUp": case "PageUp": move(-1); break;
        case "Home": setFrame(0); break;
        case "End": setFrame(last); break;
        default: return;
      }
      event.preventDefault();
    }
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchend", end);
    el.addEventListener("touchcancel", cancel);
    el.addEventListener("keydown", key);
    return () => {
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchend", end);
      el.removeEventListener("touchcancel", cancel);
      el.removeEventListener("keydown", key);
      root.style.overflow = overflow;
      el.close();
    };
  }, [closed]);

  useEffect(() => {
    if (final) earthButton.current?.focus({ preventScroll: true });
    else if (dialog.current?.open && document.activeElement === document.body) dialog.current.focus({ preventScroll: true });
  }, [final]);

  if (closed) return null;
  return <>
    <noscript><style>{".solar-intro { display: none !important; }"}</style></noscript>
    <motion.dialog open ref={dialog} tabIndex={-1} className="solar-intro"
      data-side={!stop || final ? "center" : step % 2 ? "right" : "left"} aria-labelledby="solar-title"
      onCancel={event => event.preventDefault()} initial={false} animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: reduced ? 0 : 0.48 }} onAnimationComplete={() => { if (closing) setClosed(true); }}>
      <div className="solar-matte" aria-hidden="true" />
      <div className="solar-head brand studio-wordmark">
        <Asterisk label="Faire tourner le logo stevenarts" />
        <span id="solar-title">stevenarts</span>
      </div>
      <span className="sr-only">Utilisez la molette, balayez l’écran ou appuyez sur les flèches pour parcourir l’introduction et les planètes.</span>
      {stop ? <>
        <PlanetStage step={step} reduced={reduced} />
        <article className="solar-copy" aria-live="polite" aria-atomic="true">
          <div key={step} className="solar-type">
            <p className="eyebrow"><i />{final ? "Arrivée" : "Escale"} {stepNumber(step)} / 09</p>
            <h2>{stop.name}<span>.</span></h2>
            <h3>{stop.theme}</h3>
            <p className="solar-anecdote">{stop.text}</p>
          </div>
        </article>
        {final && <button type="button" className="solar-entry" ref={earthButton}
          aria-label="Entrer dans le portfolio en cliquant sur la Terre" onClick={() => setClosing(true)} />}
      </> : <div className="solar-prologue" aria-live="polite" aria-atomic="true">
        <p key={frame}>{introduction[frame]}</p>
      </div>}
    </motion.dialog>
  </>;
}

function PlanetStage({ step, reduced }: { step: number; reduced: boolean }) {
  const [ready, setReady] = useState(false);
  return <>
    <div className="solar-fallback" data-hidden={ready} aria-hidden="true">
      {journey.slice(0, journey.length - 1).map((planet, index) => <img key={planet.id} alt=""
        className={journey[step].id === planet.id ? "foreground" : "distant"}
        style={{ "--i": index } as React.CSSProperties} src={`/solar/${planet.id}-disc.webp`} />)}
    </div>
    <SolarScene step={step} reducedMotion={reduced} onReady={setReady} />
  </>;
}
