"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Asterisk, Brand } from "./Brand";

const sections = [
  { id: "projets", name: "Projets" },
  { id: "profil", name: "À propos" },
  { id: "clients", name: "Clients" },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(entry.target.id);
      }
    }, { rootMargin: "-15% 0px -55% 0px" });
    document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    header.current?.querySelector<HTMLAnchorElement>(".nav-links a")?.focus({ preventScroll: true });
    function dismiss(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    }
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !header.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);

  return (
    <header className="site-header" ref={header}>
      <div className="shell header-inner">
        <div onClick={() => setOpen(false)}><Brand /></div>
        <nav aria-label="Navigation principale" id="main-nav" className={open ? "nav-links is-open" : "nav-links"}>
          {sections.map(({ id, name }) => <a key={id} href={`#${id}`} aria-current={active === id ? "location" : undefined} onClick={() => setOpen(false)}>{name}</a>)}
        </nav>
        <div className="header-actions">
          <a className="contact-nav" href="#contact" onClick={() => setOpen(false)}>Contact<Asterisk /></a>
          <button ref={menuButton} className="menu-button" aria-controls="main-nav" aria-expanded={open} aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
