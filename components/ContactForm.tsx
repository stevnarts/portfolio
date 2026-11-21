"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

const bookingUrl = "https://calendar.app.google/5hcUfiJu8nuWaAFE6";
const bookingEmbed = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1bolc8c-YHqsiNgcHAaE6i2D38n6QY-033ZVNFGVZkARrQbClcxcMDAs31NKDVRGDr3iKOtACa?gv=true&hl=fr";
const email = "roumilhac.steven@gmail.com";

function todayInParis() {
  return new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export default function ContactForm() {
  const [today, setToday] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const busy = useRef(false);

  useEffect(() => { setToday(todayInParis()); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = Object.fromEntries(Array.from(data, ([key, value]) => [key, String(value).trim()]));
    if (!values.firstName || !values.lastName || !values.message) {
      setStatus("Renseignez votre nom, votre prénom et votre demande.");
      return;
    }
    if (values.date && values.date < todayInParis()) {
      setToday(todayInParis());
      setStatus("Choisissez une date à partir d’aujourd’hui.");
      return;
    }
    busy.current = true;
    setPending(true);
    setStatus("");
    try {
      const result = await sendInquiry(values);
      if (result === "activation") {
        setStatus("Le formulaire est en cours d’activation. Vous pouvez contacter Steven directement par e-mail.");
        return;
      }
      form.reset();
      setMessage("");
      setStatus("Merci, votre demande a été transmise.");
    } catch {
      setStatus("L’envoi n’a pas pu être confirmé. Vous pouvez écrire directement à " + email + ".");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <form className="inquiry" action={`https://formsubmit.co/${email}`} method="post" onSubmit={submit} aria-labelledby="inquiry-heading">
      <h3 id="inquiry-heading">Votre demande</h3>
      <div className="inquiry-fields">
        <label>Nom<input autoComplete="family-name" name="lastName" maxLength={100} required /></label>
        <label>Prénom<input autoComplete="given-name" name="firstName" maxLength={100} required /></label>
        <label>Adresse e-mail<input type="email" autoComplete="email" name="email" maxLength={254} required /></label>
        <label><span>Téléphone <small>(facultatif)</small></span><input type="tel" name="phone" autoComplete="tel" maxLength={40} /></label>
        <div className="field-wide">
          <label><span>Date de RDV souhaitée <small>(facultatif)</small></span><input type="date" name="date" min={today || undefined} /></label>
          <p className="form-date-note">Vous pouvez proposer une date ou réserver directement dans mon agenda.</p>
          <details className="booking-panel" onToggle={event => setCalendarOpen(event.currentTarget.open)}>
            <summary>Choisir un créneau sur Google Agenda</summary>
            {calendarOpen && <iframe title="Disponibilités de Steven sur Google Agenda" src={bookingEmbed} loading="lazy" />}
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer">Ouvrir le calendrier dans un nouvel onglet</a>
          </details>
        </div>
        <label className="field-wide"><span className="inquiry-bottom"><span>Votre message</span><span className="character-limit">{message.length} / 1000</span></span>
          <textarea name="message" maxLength={1000} rows={4} required value={message} onChange={e => setMessage(e.target.value)} />
        </label>
      </div>
      <input type="hidden" name="_subject" value="Portfolio Stevnarts — Nouvelle demande" />
      <input type="hidden" name="_template" value="table" />
      <label className="inquiry-trap" aria-hidden="true">Site personnel<input type="text" name="_honey" autoComplete="off" tabIndex={-1} /></label>
      <div className="inquiry-footer"><button type="submit" disabled={pending} className="primary-action">{pending ? "Envoi en cours…" : "Envoyer"}</button>
        <p role="status" className="form-status">{status}</p>
      </div>
    </form>
  );
}

async function sendInquiry(values: Record<string, string>) {
  const response = await fetch(`https://formsubmit.co/ajax/${email}`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: new URLSearchParams({
      Nom: values.lastName, Prénom: values.firstName, email: values.email,
      Téléphone: values.phone, "Date souhaitée": values.date, message: values.message,
      _subject: values._subject, _template: values._template, _honey: values._honey,
    }),
    credentials: "omit",
    signal: AbortSignal.timeout(30000),
  });
  const result = await response.json();
  if (/activat|confirm your email/i.test(String(result.message))) return "activation";
  if (!response.ok || (result.success !== true && result.success !== "true")) throw new Error("Envoi non confirmé");
  return "submitted";
}
