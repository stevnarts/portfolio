import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stevnarts — Steven, graphiste & directeur artistique",
  description: "Le portfolio de Steven, graphiste et directeur artistique junior. Identité visuelle, créations graphiques et collaborations.",
  icons: { icon: "/mark.svg" },
  openGraph: {
    title: "Stevnarts — Portfolio de Steven",
    description: "Graphisme, identité visuelle et direction artistique.",
    type: "website",
    locale: "fr_FR",
  },
};

export const viewport: Viewport = { themeColor: "#101113" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="fr"><body>{children}</body></html>;
}
