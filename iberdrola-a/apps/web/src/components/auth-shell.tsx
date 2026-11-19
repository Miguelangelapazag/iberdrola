import type { ReactNode } from "react";
import Image from "next/image";
import { BookOpen, ShieldCheck, Users } from "lucide-react";
import { Brand } from "@/components/brand";
import { PublicHeader } from "@/components/public-header";

/**
 * Ventana de acceso: extensión de la portada. Conserva el menú público,
 * el fondo azul y la fotografía enmarcada del colegio.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="school-home auth-page min-h-screen text-[#102e57]">
      <PublicHeader current="/login" />
      <main className="public-hero auth-hero">
        <div className="hero-orb hero-orb-one" aria-hidden="true" />
        <div className="hero-orb hero-orb-two" aria-hidden="true" />
        <div className="hero-layout mx-auto grid max-w-7xl items-center gap-12 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.08fr_1fr]">
          <div className="auth-photography hidden lg:block">
            <p className="hero-eyebrow">PRIMARIA COMUNITARIA VOCACIONAL</p>
            <div className="hero-photo-frame relative aspect-[4/3.4] overflow-hidden rounded-[2rem] bg-slate-200">
              <Image
                src="/colegio/colegio3.jpg"
                alt="Encuentro de la comunidad educativa de Iberdrola A"
                fill
                preload
                sizes="(max-width: 1024px) 0vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#082553]/90 via-[#082553]/20 to-transparent" />
              <div className="absolute inset-x-8 bottom-8 text-white">
                <p className="text-4xl font-semibold leading-[1.15] tracking-tight">
                  Cada estudiante.
                  <br />
                  Cada avance.
                  <br />
                  <span className="text-sky-200">Un mismo lugar.</span>
                </p>
              </div>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-200">
              {[
                [BookOpen, "Calificaciones y asistencia"],
                [Users, "Escuela y familias conectadas"],
                [ShieldCheck, "Acceso según tu rol"],
              ].map(([Icon, label]) => {
                const I = Icon as typeof BookOpen;
                return (
                  <li className="flex items-center gap-2" key={String(label)}>
                    <I className="text-sky-200" size={18} aria-hidden="true" />
                    {String(label)}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="auth-card mx-auto w-full">
            <div className="mb-12">
              <Brand />
            </div>
            {children}
            <p className="mt-12 text-center text-xs text-muted-foreground">
              Primaria · 14:00 a 18:05 · La Paz, Bolivia
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
