import Link from "next/link";
import Image from "next/image";
import { VisualMotion } from "@/components/visual-motion";
import { Brand } from "@/components/brand";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  ShieldCheck,
  Clock3,
} from "lucide-react";
import { school, socialLinks } from "@/lib/school";
export const metadata: Metadata = {
  title: "Unidad Educativa Iberdrola A · El Alto",
  description:
    "Conoce la Unidad Educativa Iberdrola A, su historia y ubicación en El Alto. Accede al sistema académico de Primaria.",
};
export default function Home() {
  const socials = socialLinks();
  return (
    <VisualMotion>
      <div className="school-home min-h-screen text-[#102e57]">
        <a
          href="#contenido"
          className="sr-only z-50 rounded bg-white p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Saltar al contenido
        </a>
        <header className="public-header">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-10">
            <Link
              href="/"
              aria-label="Iberdrola A, inicio"
              className="flex items-center gap-3"
            >
              <Image
                src="/colegio/iberdrola_escudo.jpg"
                loading="eager"
                alt="Escudo de la Unidad Educativa Iberdrola A"
                width={436}
                height={458}
                className="h-14 w-14 rounded-lg bg-white object-contain"
              />
              <span>
                <span className="block text-lg font-bold tracking-tight">
                  Iberdrola A.
                </span>
                <span className="block text-[10px] uppercase tracking-[.18em]">
                  Unidad Educativa
                </span>
              </span>
            </Link>
            <nav
              aria-label="Navegación pública"
              className="order-3 flex w-full gap-6 overflow-x-auto text-sm sm:order-none sm:w-auto"
            >
              <a href="#colegio" className="py-2 hover:underline">
                El colegio
              </a>
              <a href="#galeria" className="py-2 hover:underline">
                Galería
              </a>
              <a href="#historia" className="py-2 hover:underline">
                Historia
              </a>
              <a href="#contacto" className="py-2 hover:underline">
                Contacto
              </a>
            </nav>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[#102e57] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1c487e]"
            >
              Iniciar sesión <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </header>
        <main id="contenido">
          <section className="public-hero">
            <div className="hero-orb hero-orb-one" aria-hidden="true" />
            <div className="hero-orb hero-orb-two" aria-hidden="true" />
            <div className="hero-layout mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 sm:px-10 sm:py-24 lg:grid-cols-[1.08fr_1fr]">
              <div>
                <p className="mb-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.2em]">
                  <span className="size-2 rounded-full bg-[#267cc2]" />
                  El Alto · La Paz · Bolivia
                </p>
                <p className="hero-eyebrow">ESTUDIO · PATRIA · LIBERTAD</p>
                <h1 className="text-5xl font-semibold leading-[1.04] tracking-[-.055em] sm:text-7xl xl:text-[86px]">
                  Unidad Educativa
                  <br />
                  <span className="text-[#2169a3]">Iberdrola A.</span>
                </h1>
                <p className="mt-7 max-w-md text-lg leading-8 text-[#586b80]">
                  Un espacio para aprender, crecer y mantener cerca a nuestra
                  comunidad educativa.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-3 rounded-full bg-[#102e57] px-6 py-4 text-sm font-semibold text-white hover:bg-[#1c487e]"
                  >
                    Ingresar al sistema{" "}
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                  <a
                    href="#colegio"
                    className="rounded-full border border-[#102e57]/25 px-6 py-4 text-sm font-semibold hover:bg-white"
                  >
                    Conoce el colegio
                  </a>
                </div>
                <p className="mt-5 max-w-md text-xs leading-5 text-[#586b80]">
                  La información del colegio es pública. Para consultar datos
                  académicos necesitas una cuenta institucional.
                </p>
              </div>
              <div className="hero-photography relative pb-10 lg:pl-4">
                <div className="hero-photo-frame relative aspect-[4/4.1] overflow-hidden rounded-[2rem] bg-slate-200 shadow-2xl shadow-blue-950/15">
                  <Image
                    src="/colegio/colegio2.jpg"
                    alt="Celebración del Día del Niño en el patio de Iberdrola A"
                    fill
                    preload
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-[58%_center]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#082553]/85 via-transparent to-transparent" />
                  <div className="absolute bottom-28 left-7 right-7 text-white">
                    <p className="mb-3 text-xs uppercase tracking-[.2em] text-blue-100">
                      La vida en nuestra escuela
                    </p>
                    <p className="text-3xl font-semibold tracking-tight">
                      Grandes momentos.
                      <br />
                      Recuerdos compartidos.
                    </p>
                  </div>
                </div>
                <div className="hero-floating-card absolute -bottom-1 left-3 flex max-w-[90%] items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:left-[-12px]">
                  <Image
                    src="/colegio/colegio.jpg"
                    alt="Estudiantes reunidos en el patio cubierto"
                    width={516}
                    height={387}
                    className="h-20 w-24 rounded-xl object-cover"
                  />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Nuestra comunidad
                    </p>
                    <p className="mt-1 font-semibold">Aprender nos acerca.</p>
                    <a
                      href="#galeria"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-800"
                    >
                      Ver fotografías <ArrowUpRight size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section
            data-reveal
            id="colegio"
            className="school-facts scroll-mt-6 border-y border-[#102e57]/10 bg-white/60"
          >
            <div className="mx-auto grid max-w-7xl gap-7 px-6 py-10 sm:grid-cols-3 sm:px-10">
              {[
                [
                  "01 / Institución",
                  "Educación fiscal",
                  "Iberdrola A · El Alto",
                ],
                [
                  "02 / Identificación",
                  `RUE ${school.rue}`,
                  "Código publicado en el directorio",
                ],
                [
                  "03 / Niveles",
                  "Inicial y Primaria",
                  "Niveles indicados por el directorio",
                ],
              ].map(([tag, title, detail]) => (
                <div key={tag}>
                  <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#586b80]">
                    {tag}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold">{title}</h2>
                  <p className="mt-2 text-sm text-[#586b80]">{detail}</p>
                </div>
              ))}
            </div>
          </section>
          <section
            data-reveal
            id="galeria"
            className="texture-dots scroll-mt-8"
          >
            <div className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10 sm:py-20">
              <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.2em] text-blue-700">
                    Nuestra vida escolar
                  </p>
                  <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                    Una escuela que se vive.
                  </h2>
                </div>
                <p className="max-w-sm text-sm leading-6 text-slate-600">
                  Encuentros, cultura y espacios que forman parte de nuestra
                  comunidad. Abre cada fotografía para verla completa.
                </p>
              </div>
              <div className="grid gap-5 md:h-[640px] md:grid-cols-3 md:grid-rows-2">
                {[
                  [
                    "colegio5.jpg",
                    "Un patio lleno de vida",
                    "Vista del patio cubierto durante una actividad escolar",
                    "01",
                    "md:col-span-2 md:row-span-2",
                    "(max-width: 768px) 100vw, 66vw",
                  ],
                  [
                    "colegio3.jpg",
                    "Cultura que nos une",
                    "Encuentro de la comunidad con vestimenta tradicional",
                    "02",
                    "",
                    "(max-width: 768px) 100vw, 33vw",
                  ],
                  [
                    "colegio4.jpg",
                    "Momentos para compartir",
                    "Estudiantes y familias reunidos en el patio",
                    "03",
                    "",
                    "(max-width: 768px) 100vw, 33vw",
                  ],
                ].map(([file, title, alt, number, span, sizes]) => (
                  <a
                    key={file}
                    href={`/colegio/${file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${title}: abrir fotografía completa en otra pestaña`}
                    className={`photo-card group relative block aspect-[4/3] overflow-hidden bg-slate-200 transition-shadow hover:shadow-xl md:aspect-auto md:h-full ${span}`}
                  >
                    <Image
                      src={`/colegio/${file}`}
                      alt={alt}
                      fill
                      sizes={sizes}
                      className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-[#06193d]/90 via-[#06193d]/50 to-transparent p-5 pt-16 text-white sm:p-7 sm:pt-20">
                      <div>
                        <p className="mb-1.5 text-xs tracking-wider text-blue-100">
                          {number} / IBERDROLA A
                        </p>
                        <h3 className="text-lg font-semibold sm:text-xl">
                          {title}
                        </h3>
                      </div>
                      <ArrowUpRight
                        size={22}
                        aria-hidden="true"
                        className="shrink-0"
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
          <section
            data-reveal
            id="historia"
            className="texture-lines scroll-mt-8"
          >
            <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-16 sm:px-10 sm:py-24 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#586b80]">
                  Nuestra historia
                </p>
                <h2 className="mt-5 text-4xl font-medium leading-tight tracking-[-.04em] sm:text-5xl">
                  Una comunidad
                  <br />
                  que crece
                  <br />
                  <span className="text-[#2169a3]">con su escuela.</span>
                </h2>
                <p className="mt-8 text-lg leading-8">
                  Una reseña publicada en 2023 sitúa el origen de la Unidad
                  Educativa Iberdrola en Senkata el 1 de marzo de 2002. Describe
                  su crecimiento y la posterior organización en las secciones A
                  y B.
                </p>
                <p className="mt-5 text-base leading-7 text-[#586b80]">
                  La misma reseña recuerda la participación de su comunidad en
                  actividades deportivas, musicales y artísticas.
                </p>
                <div className="mt-7 border-l-2 border-[#6b9ac9] pl-5">
                  <p className="text-xs leading-6 text-[#586b80]">
                    Referencia histórica del blog sobre Iberdrola B, no una
                    certificación de la fecha de creación independiente de
                    Iberdrola A. Los logros específicos de la sección B no se
                    atribuyen aquí a la sección A.
                  </p>
                  <a
                    href={school.historyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
                  >
                    Leer la reseña histórica{" "}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </div>
              </div>
              <figure className="history-photo overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-xl shadow-blue-950/10">
                <div className="flex items-center justify-center bg-gradient-to-br from-[#dce9fb] to-[#f3f7ff] p-6 sm:p-10">
                  <Image
                    src="/colegio/edificio.jpg"
                    alt="Edificio de la unidad educativa con banderas"
                    width={400}
                    height={200}
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="h-auto w-full max-w-[640px] rounded-xl object-contain"
                  />
                </div>
                <figcaption className="flex items-center justify-between gap-4 px-6 py-5 sm:px-10">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-blue-700">
                      Senkata · El Alto
                    </p>
                    <p className="mt-1.5 text-xl font-semibold">
                      Un lugar en nuestra historia.
                    </p>
                  </div>
                </figcaption>
              </figure>
            </div>
          </section>
          <section
            data-reveal
            className="platform-section mx-4 rounded-[2rem] bg-[#102e57] text-[#f7f9fc] sm:mx-6"
          >
            <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:px-10 lg:grid-cols-2">
              <div>
                <div className="mb-8">
                  <Brand dark />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#a8d6ff]">
                  Un vínculo con las familias
                </p>
                <h2 className="mt-5 text-4xl font-medium leading-tight tracking-tight">
                  La escuela, también
                  <br />a un clic de distancia.
                </h2>
                <p className="mt-5 max-w-md text-sm leading-7 text-[#c7d7eb]">
                  El sistema de Primaria reúne calificaciones, asistencia y
                  horarios. Cada cuenta consulta únicamente la información que
                  le corresponde.
                </p>
                <Link
                  href="/login"
                  className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#deeeff] px-6 py-4 text-sm font-semibold text-[#102e57]"
                >
                  Acceso a la plataforma{" "}
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
              <div className="space-y-6 lg:pt-4">
                {[
                  [
                    GraduationCap,
                    "Primaria",
                    "El alcance de esta plataforma académica es Primaria.",
                  ],
                  [
                    Clock3,
                    "Turno tarde",
                    "Horario de referencia del proyecto: 14:00 a 18:05.",
                  ],
                  [
                    ShieldCheck,
                    "Acceso institucional",
                    "Las cuentas y permisos son administrados por la institución.",
                  ],
                ].map(([Icon, title, body]) => {
                  const I = Icon as typeof GraduationCap;
                  return (
                    <div
                      key={String(title)}
                      className="flex gap-4 border-b border-white/15 pb-6"
                    >
                      <I
                        className="mt-1 shrink-0 text-[#deeeff]"
                        size={23}
                        aria-hidden="true"
                      />
                      <div>
                        <h3 className="font-semibold">{String(title)}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#c7d7eb]">
                          {String(body)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>
        <footer
          id="contacto"
          className="scroll-mt-24 border-t border-[#102e57]/15 px-6 py-12 sm:px-10"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 pb-10 lg:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#586b80]">
                  Ubicación y contacto
                </p>
                <h2 className="mt-5 text-4xl font-medium tracking-tight">
                  Estamos en El Alto.
                </h2>
                <p className="mt-5 max-w-sm text-sm leading-7 text-[#586b80]">
                  Para consultas de inscripción o atención, confirma
                  directamente con la institución la vigencia de estos datos
                  publicados en el directorio.
                </p>
              </div>
              <div className="rounded-2xl border border-[#102e57]/15 bg-white p-6 sm:p-8">
                <div className="flex gap-4">
                  <MapPin aria-hidden="true" className="shrink-0" />
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-[#586b80]">
                      Dirección publicada
                    </h3>
                    <p className="mt-2 text-lg font-medium">{school.address}</p>
                    <p className="mt-1 text-sm text-[#586b80]">
                      El Alto, La Paz, Bolivia
                    </p>
                    <a
                      href={school.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
                    >
                      Buscar la dirección en Maps{" "}
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </a>
                  </div>
                </div>
                <div className="mt-6 flex gap-4 border-t border-[#102e57]/10 pt-6">
                  <Phone aria-hidden="true" className="shrink-0" />
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-[#586b80]">
                      Teléfono publicado
                    </h3>
                    <a
                      className="mt-2 inline-block text-2xl font-medium hover:underline"
                      href={`tel:+591${school.phone}`}
                    >
                      {school.phone}
                    </a>
                    <p className="mt-2 text-xs text-[#586b80]">
                      No verificado directamente con el colegio.
                    </p>
                  </div>
                </div>
                {school.email && (
                  <div className="mt-6 flex gap-4 border-t border-[#102e57]/10 pt-6">
                    <Mail aria-hidden="true" className="shrink-0" />
                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-[#586b80]">
                        Correo de comunicación
                      </h3>
                      <a
                        className="mt-2 inline-block break-all text-lg font-medium hover:underline"
                        href={`mailto:${school.email}`}
                      >
                        {school.email}
                      </a>
                    </div>
                  </div>
                )}
                {socials.length > 0 && (
                  <div className="mt-6 border-t border-[#102e57]/10 pt-6">
                    <h3 className="text-xs uppercase tracking-wider text-[#586b80]">
                      Redes sociales
                    </h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {socials.map(([name, url]) => (
                        <li key={name}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#102e57]/20 px-4 py-2 text-sm font-semibold hover:bg-[#102e57] hover:text-white"
                          >
                            {name}
                            <ArrowUpRight size={14} aria-hidden="true" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap justify-between gap-4 border-t border-[#102e57]/10 pt-6 text-sm">
              <p className="font-semibold">U.E. Iberdrola A · El Alto</p>
              <Link href="/login" className="underline underline-offset-4">
                Ingresar con mi cuenta
              </Link>
            </div>
            <details className="mt-6 text-xs leading-6 text-[#586b80]">
              <summary className="cursor-pointer font-medium">
                Fuentes de información y alcance
              </summary>
              <p className="mt-3">
                Información consultada el 9 de octubre de 2026. Las fuentes son
                referencias externas; su contenido no equivale a una validación
                institucional. Las fotografías fueron proporcionadas para esta
                portada; los registros académicos permanecen dentro del sistema.
              </p>
              <ul className="mt-2 list-inside list-disc">
                <li>
                  <a
                    href={school.directoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    UnidadEducativa.net: ficha de Iberdrola A
                  </a>{" "}
                  — identificación, niveles, dirección y teléfono.
                </li>
                <li>
                  <a
                    href={school.historyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Blog: Historia de la Unidad Educativa Iberdrola
                  </a>{" "}
                  — reseña publicada el 24 de septiembre de 2023.
                </li>
              </ul>
              <p className="mt-2">
                El alcance de Primaria y el turno tarde corresponden a la
                configuración acordada para este proyecto. El escudo del colegio
                y el logo IberAcad son las imágenes facilitadas para este
                proyecto.
              </p>
            </details>
          </div>
        </footer>
      </div>
    </VisualMotion>
  );
}
