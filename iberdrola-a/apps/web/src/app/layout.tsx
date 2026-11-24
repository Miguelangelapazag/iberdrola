import type { Metadata } from "next";
import "./globals.css";
import { AuthLinkHandler } from "@/components/auth-link-handler";
export const metadata: Metadata = {
  title: {
    default: "Iberdrola A · Gestión académica",
    template: "%s · Iberdrola A",
  },
  description:
    "Sistema de gestión académica para Primaria de la U.E. Iberdrola A.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>
        <AuthLinkHandler />
        {children}
      </body>
    </html>
  );
}
