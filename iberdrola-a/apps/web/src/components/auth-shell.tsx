import type { ReactNode } from "react";
import { BookOpen, ShieldCheck, Users } from "lucide-react";
import { Brand } from "@/components/brand";

/**
 * Ventana de acceso: panel azul a la izquierda con el logo de IberAcad
 * (grande, arriba a la izquierda) y la tarjeta de ingreso a la derecha.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="school-home auth-page auth-layout grid min-h-screen text-[#102e57] lg:grid-cols-[1.02fr_1fr]">
      <aside className="auth-art relative flex flex-col justify-between overflow-hidden px-6 py-6 text-white sm:px-9 sm:py-9">
        <div className="auth-logo-box">
          <Brand />
        </div>
        <div className="auth-art-copy hidden lg:block">
          <p className="hero-eyebrow">PRIMARIA COMUNITARIA VOCACIONAL</p>
          <p className="auth-art-title">
            Cada estudiante.
            <br />
            Cada avance.
            <br />
            <span>Un mismo lugar.</span>
          </p>
          <p className="auth-art-lead">
            Información académica organizada para acompañar el aprendizaje y
            acercar a la escuela con las familias.
          </p>
          <ul className="mt-8 grid gap-3 text-sm text-slate-200">
            {[
              [BookOpen, "Calificaciones y asistencia"],
              [Users, "Escuela y familias conectadas"],
              [ShieldCheck, "Acceso según tu rol"],
            ].map(([Icon, label]) => {
              const I = Icon as typeof BookOpen;
              return (
                <li className="flex items-center gap-3" key={String(label)}>
                  <I className="text-sky-200" size={18} aria-hidden="true" />
                  {String(label)}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
      <section className="flex items-center justify-center">
        <div className="auth-card w-full">
          {children}
          <p className="mt-12 text-center text-xs text-muted-foreground">
            Primaria · 14:00 a 18:05 · La Paz, Bolivia
          </p>
        </div>
      </section>
    </div>
  );
}
