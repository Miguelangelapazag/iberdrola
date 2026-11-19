import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { school, socialLinks } from "@/lib/school";
import { publicNav } from "@/components/public-header";

export function PublicFooter({ compact = false }: { compact?: boolean }) {
  const socials = socialLinks();
  return (
    <footer className="bg-[#102247] px-6 pb-8 pt-14 text-white sm:px-10">
      <div className="mx-auto max-w-7xl">
        <div
          className={`grid gap-10 sm:grid-cols-2 ${compact ? "" : "lg:grid-cols-4"}`}
        >
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/colegio/iberdrola_escudo.jpg"
                alt="Escudo de la Unidad Educativa Iberdrola A"
                width={436}
                height={458}
                className="h-14 w-14 rounded-lg bg-white object-contain"
              />
              <div>
                <p className="text-lg font-bold tracking-tight">Iberdrola A.</p>
                <p className="text-[10px] uppercase tracking-[.18em] text-[#b9cbe6]">
                  Unidad Educativa
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-6 text-[#c7d7eb]">
              Primaria · Turno tarde.
              <br />
              El Alto, La Paz, Bolivia.
            </p>
          </div>
          {compact ? (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[.18em] text-[#a8d6ff]">
                Navegar
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {[{ href: "/", label: "Página principal" }, ...publicNav].map(
                  (item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="inline-flex rounded-full border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white hover:text-[#102247]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ) : (
            <>
              <div>
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-[#a8d6ff]">
                  <MapPin size={15} aria-hidden="true" />
                  Dirección
                </h3>
                <p className="mt-4 text-base font-medium">{school.address}</p>
                <p className="mt-1 text-sm text-[#c7d7eb]">
                  El Alto, La Paz, Bolivia
                </p>
                <a
                  href={school.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
                >
                  Ver en Maps <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>
              <div>
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-[#a8d6ff]">
                  <Phone size={15} aria-hidden="true" />
                  Comunicación
                </h3>
                <a
                  className="mt-4 inline-block text-2xl font-medium hover:underline"
                  href={`tel:+591${school.phone}`}
                >
                  {school.phone}
                </a>
                {school.email && (
                  <a
                    className="mt-3 flex items-center gap-2 break-all text-sm hover:underline"
                    href={`mailto:${school.email}`}
                  >
                    <Mail size={15} aria-hidden="true" className="shrink-0" />
                    {school.email}
                  </a>
                )}
                <p className="mt-3 max-w-xs text-xs leading-5 text-[#b9cbe6]">
                  Datos del directorio, no verificados directamente con el
                  colegio. Confirma su vigencia al comunicarte.
                </p>
              </div>
              {socials.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[.18em] text-[#a8d6ff]">
                    Redes sociales
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {socials.map(([name, url]) => (
                      <li key={name}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white hover:text-[#102247]"
                        >
                          {name}
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-sm">
          <p className="font-semibold">U.E. Iberdrola A · El Alto</p>
          <Link href="/login" className="underline underline-offset-4">
            Ingresar con mi cuenta
          </Link>
        </div>
        <details className="mt-5 text-xs leading-6 text-[#b9cbe6]">
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
                className="underline underline-offset-2"
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
                className="underline underline-offset-2"
              >
                Blog: Historia de la Unidad Educativa Iberdrola
              </a>{" "}
              — reseña publicada el 24 de septiembre de 2023.
            </li>
          </ul>
          <p className="mt-2">
            El alcance de Primaria y el turno tarde corresponden a la
            configuración acordada para este proyecto. El escudo del colegio y
            el logo IberAcad son las imágenes facilitadas para este proyecto.
          </p>
        </details>
      </div>
    </footer>
  );
}
