import type { ReactNode } from "react";
import { Mail, Phone } from "lucide-react";
import ContactForm from "./ContactForm";
import "./contact.css";

const socials = [
  { name: "Instagram", href: "https://www.instagram.com/stevnarts/", icon: <g fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4.15" /><circle cx="17.65" cy="6.55" r=".95" fill="currentColor" stroke="none" /></g> },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/steven-roumilhac/", icon: <path fill="currentColor" d="M20.45 2H3.55A1.55 1.55 0 0 0 2 3.55v16.9A1.55 1.55 0 0 0 3.55 22h16.9A1.56 1.56 0 0 0 22 20.45V3.55A1.56 1.56 0 0 0 20.45 2ZM8.12 18.75H5.16V9.2h2.96ZM6.64 7.9a1.72 1.72 0 1 1 0-3.44 1.72 1.72 0 0 1 0 3.44Zm12.11 10.85h-2.96v-4.64c0-1.1-.02-2.53-1.54-2.53-1.54 0-1.78 1.2-1.78 2.45v4.72H9.5V9.2h2.85v1.31h.04a3.12 3.12 0 0 1 2.81-1.54c3 0 3.56 1.98 3.56 4.54Z" /> },
  { name: "Behance", href: "https://www.behance.net/stevnarts", icon: <path fill="currentColor" fillRule="evenodd" d="M1 5h6.3c3.4 0 5 1.2 5 3.6 0 1.4-.7 2.4-1.9 3 1.7.5 2.5 1.8 2.5 3.5 0 2.8-2.1 4.3-5.4 4.3H1Zm3.1 2.5v3.2h3c1.3 0 2-.5 2-1.6s-.7-1.6-2.2-1.6Zm0 5.5v3.9h3.1c1.6 0 2.5-.6 2.5-2 0-1.3-.9-1.9-2.5-1.9Zm10.6-7.4h6.4v1.6h-6.4Zm8.6 9.5H16c.1 1.5.9 2.3 2.4 2.3 1 0 1.7-.4 2-1h2.8c-.7 2.1-2.3 3.2-4.9 3.2-3.2 0-5.2-2.1-5.2-5.3s2.1-5.5 5.2-5.5c3.4 0 5.2 2.4 5 6.3ZM16 13.2h4.4c-.1-1.3-.9-2.1-2.1-2.1-1.3 0-2.1.8-2.3 2.1Z" /> },
];

export default function Contact({ decoration }: { decoration: ReactNode }) {
  return (
    <div className="shell contact-spread">
      <div className="contact-info">
        <p className="eyebrow"><i />Contact</p>
        <h2 id="contact-title">Parlons de<br />votre projet<span>.</span></h2>
        <address>
          <a href="mailto:roumilhac.steven@gmail.com"><Mail aria-hidden size={18} />roumilhac.steven@gmail.com</a>
          <a href="tel:+33622681231"><Phone aria-hidden size={18} />06 22 68 12 31</a>
        </address>
        <div className="socials">{socials.map(({ name, href, icon }) => (
          <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={name + " (nouvel onglet)"} title={name}><svg aria-hidden viewBox="0 0 24 24">{icon}</svg></a>
        ))}</div>
        {decoration}
      </div>
      <ContactForm />
    </div>
  );
}
