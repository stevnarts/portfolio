"use client";

import { useId, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import "./studio-accents.css";

type Point = { x: number; y: number };

function circlePoint(degrees: number, radius: number): Point {
  const radians = degrees * Math.PI / 180;
  return { x: 50 + radius * Math.cos(radians), y: 50 + radius * Math.sin(radians) };
}

const starOutline = Array.from({ length: 8 }, (_, index) => {
  const angle = index * 45;
  return [circlePoint(angle - 9, 48), circlePoint(angle + 9, 48), circlePoint(angle + 22.5, 20)];
}).flat();
const coinOutline = Array.from({ length: 48 }, (_, i) => circlePoint(i * 7.5, 49.6));
const starClip = `polygon(${starOutline.map(p => `${p.x.toFixed(2)}% ${p.y.toFixed(2)}%`).join(", ")})`;
const starPoints = starOutline.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

function makeEdges(points: Point[]) {
  return points.map((start, i) => {
    const end = points[(i + 1) % points.length];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx);
    return {
      left: `${start.x.toFixed(3)}%`,
      top: `calc(${start.y.toFixed(3)}% - var(--edge-depth) / 2)`,
      width: `${(Math.hypot(dx, dy) + 0.22).toFixed(3)}%`,
      transform: `rotateZ(${angle.toFixed(4)}rad) rotateX(90deg)`,
      "--edge-light": `${Math.round(36 + 14 * Math.cos(angle + 1))}%`,
    } as CSSProperties;
  });
}
const starEdges = makeEdges(starOutline);
const coinEdges = makeEdges(coinOutline);

function Turntable({ label, className, halfTurn = false, children }: {
  label: string; className: string; halfTurn?: boolean; children: ReactNode;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const rotation = useRef({ x: -13, y: 13 });
  const gesture = useRef<{ id: number; x: number; y: number; rx: number; ry: number } | null>(null);
  const moved = useRef(false);

  function orient(x: number, y: number) {
    rotation.current = { x, y };
    button.current?.style.setProperty("--pitch", `${x}deg`);
    button.current?.style.setProperty("--yaw", `${y}deg`);
  }

  function press(event: PointerEvent<HTMLButtonElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    moved.current = false;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, rx: rotation.current.x, ry: rotation.current.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function drag(event: PointerEvent<HTMLButtonElement>) {
    const start = gesture.current;
    if (start?.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!moved.current && Math.hypot(dx, dy) < 4) return;
    moved.current = true;
    event.currentTarget.dataset.dragging = "true";
    const degreesPerPixel = 270 / Math.max(event.currentTarget.clientWidth, 120);
    orient(start.rx - dy * degreesPerPixel, start.ry + dx * degreesPerPixel);
  }
  function release(event: PointerEvent<HTMLButtonElement>) {
    if (gesture.current?.id !== event.pointerId) return;
    gesture.current = null;
    delete event.currentTarget.dataset.dragging;
  }
  function keys(event: KeyboardEvent<HTMLButtonElement>) {
    const { x, y } = rotation.current;
    switch (event.key) {
      case "ArrowLeft": orient(x, y - 30); break;
      case "ArrowRight": orient(x, y + 30); break;
      case "ArrowUp": orient(x + 30, y); break;
      case "ArrowDown": orient(x - 30, y); break;
      case "Home": orient(-13, 13); break;
      default: return;
    }
    event.preventDefault();
  }
  return (
    <button ref={button} type="button" className={`studio-turntable ${className}`} aria-label={label}
      aria-description="Cliquez pour faire tourner. Glissez ou utilisez les flèches pour orienter l’objet."
      title={label} onPointerDown={press} onPointerMove={drag} onPointerUp={release} onLostPointerCapture={release}
      onPointerCancel={release} onKeyDown={keys} onClick={event => {
        event.stopPropagation();
        if (event.detail === 0 || !moved.current) {
          orient(rotation.current.x, rotation.current.y + (halfTurn ? 180 : 145));
        }
        moved.current = false;
      }}>
      <span className="studio-object" aria-hidden="true">{children}</span>
    </button>
  );
}

export function Asterisk({ className = "", label = "Faire tourner l’étoile" }: { className?: string; label?: string }) {
  return (
    <Turntable className={`asterisk studio-star ${className}`} label={label}>
      {starEdges.map((edge, i) => <span key={i} className="solid-edge" style={edge} />)}
      <span className="solid-face star-face face-front" style={{ clipPath: starClip }} />
      <span className="solid-face star-face face-back" style={{ clipPath: starClip }} />
    </Turntable>
  );
}

function CoinFace({ back = false }: { back?: boolean }) {
  const id = useId();
  return <span className={`solid-face coin-face ${back ? "face-back" : "face-front"}`}>
    <svg viewBox="0 0 120 120" focusable="false">
      <defs><path id={id} d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0" /></defs>
      <circle cx="60" cy="60" r="57" className="coin-rim" />
      <circle cx="60" cy="60" r="36" className="coin-rim" />
      <circle cx="60" cy="60" r="53.7" className="coin-knurl" />
      <text className="coin-legend"><textPath href={`#${id}`} textLength="282" lengthAdjust="spacing">{back ? "STEVEN ROUMILHAC • GRAPHISME • " : "STEVNARTS • DIRECTION ARTISTIQUE • "}</textPath></text>
      {back ? <text x="58.5" y="72.5" textAnchor="middle" className="coin-monogram">SR</text> :
        <polygon points={starPoints} transform="translate(36 36) scale(.48)" className="coin-emblem" />}
    </svg>
  </span>;
}

export function StudioCoin() {
  return (
    <Turntable className="studio-seal studio-coin" label="Retourner la pièce du studio" halfTurn>
      {coinEdges.map((edge, i) => <span key={i} className="solid-edge" style={edge} />)}
      <CoinFace /><CoinFace back />
    </Turntable>
  );
}

export function StarField() {
  return <div className="studio-sky" aria-hidden="true">
    <span className="studio-sky__stars" />
    <span className="studio-sky__drift" />
  </div>;
}
