export function Asterisk({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`asterisk ${className}`}><i /><i /><i /><i /></span>;
}

export function Brand() {
  return <a className="brand" href="#accueil" aria-label="Stevnarts, accueil"><Asterisk />stevnarts<span className="brand-stop">.</span></a>;
}
