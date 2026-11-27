import type { ReactNode } from "react";
import {
  Award,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";

/** Lo que hace el sistema, módulo por módulo. */
const features: [typeof GraduationCap, string, string][] = [
  [GraduationCap, "Estudiantes y cursos", "Fichas, tutores y matrículas."],
  [CalendarDays, "Horarios", "Periodos y clases de cada curso."],
  [ClipboardCheck, "Asistencia", "Pasar lista y consultar faltas."],
  [Award, "Calificaciones", "Notas por materia y trimestre."],
  [ChartNoAxesCombined, "Informes", "Reportes para imprimir o descargar."],
];

/**
 * Ventana de acceso: panel azul a la izquierda con el logo de IberAcad
 * (grande, arriba a la izquierda) y la tarjeta de ingreso a la derecha.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="school-home auth-page text-[#102e57]">
      <div className="auth-screen">
        <PublicHeader current="/login" />
        <main
          id="contenido"
          className="auth-layout grid lg:grid-cols-[1.02fr_1fr]"
        >
          <aside className="auth-art relative flex flex-col overflow-hidden text-white">
            <div className="auth-logo-box">
              <Brand />
            </div>
            <div className="auth-art-copy hidden lg:block">
              <p className="hero-eyebrow">SISTEMA DE GESTIÓN ACADÉMICA</p>
              <p className="auth-art-title">
                Inicio de <span>sesión.</span>
              </p>
              <p className="auth-art-lead">
                IberAcad organiza el trabajo diario de la escuela: Dirección y
                Secretaría administran, los docentes registran, y las familias y
                estudiantes consultan lo que les corresponde.
              </p>
              <ul className="auth-features">
                {features.map(([Icon, title, body]) => (
                  <li key={title}>
                    <span className="auth-feature-icon">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-semibold text-white">{title}</p>
                      <p>{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          <section className="flex items-center justify-center">
            <div className="auth-card w-full">{children}</div>
          </section>
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}
