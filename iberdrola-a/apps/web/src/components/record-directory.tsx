import Link from "next/link";
import { Eye, Pencil, Search } from "lucide-react";
import type { FilterOptions } from "@/lib/data/management";
import type { Listing } from "@/lib/data/model";
import {
  filtersToParams,
  type ManagementFilters,
  type ManagementMode,
  type ManagementSection,
} from "@/lib/management-validation";
import { RecordToggle } from "@/components/record-toggle";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const selectClass =
  "h-12 w-full rounded-lg border border-input bg-background px-3 text-sm";
const PAGE_SIZE = 25;
type Option = { id: string; label: string };
type Select = { name: keyof ManagementFilters; label: string; all: string; options: Option[] };

const placeholders: Record<ManagementSection, string> = {
  estudiantes: "Ej.: María Quispe o CI",
  tutores: "Ej.: nombre, apellido o CI",
  docentes: "Ej.: nombre, apellido o CI",
  cursos: "Ej.: paralelo A",
  matriculas: "Ej.: nombre, apellido o CI del estudiante",
  asignaciones: "Ej.: nombre del docente",
};
const noun: Record<ManagementSection, [string, string]> = {
  estudiantes: ["estudiante", "estudiantes"],
  tutores: ["tutor", "tutores"],
  docentes: ["docente", "docentes"],
  cursos: ["curso", "cursos"],
  matriculas: ["matrícula", "matrículas"],
  asignaciones: ["asignación", "asignaciones"],
};

/** Filtros propios de cada sección, además de la búsqueda por texto. */
function selectsFor(
  section: ManagementSection,
  options: FilterOptions,
): Select[] {
  const estado: Select =
    section === "matriculas"
      ? {
          name: "estado",
          label: "Estado",
          all: "Todos",
          options: [
            { id: "ACTIVA", label: "Activa" },
            { id: "RETIRADA", label: "Retirada" },
            { id: "FINALIZADA", label: "Finalizada" },
          ],
        }
      : {
          name: "estado",
          label: "Estado",
          all: "Todos",
          options: [
            { id: "activos", label: "Activos" },
            { id: "inactivos", label: "Inactivos" },
          ],
        };
  const year: Select = {
    name: "gestion",
    label: "Gestión",
    all: "Todas",
    options: options.years,
  };
  const grade: Select = {
    name: "grado",
    label: "Grado",
    all: "Todos",
    options: Array.from({ length: 6 }, (_, i) => ({
      id: String(i + 1),
      label: `${i + 1}° de primaria`,
    })),
  };
  const course: Select = {
    name: "curso",
    label: "Curso",
    all: "Todos",
    options: options.courses,
  };
  switch (section) {
    case "estudiantes":
      return [
        estado,
        course,
        {
          name: "genero",
          label: "Género",
          all: "Todos",
          options: [
            { id: "M", label: "Masculino" },
            { id: "F", label: "Femenino" },
            { id: "NO_ESPECIFICADO", label: "No especificado" },
          ],
        },
      ];
    case "cursos":
      return [estado, year, grade];
    case "matriculas":
      return [estado, year, course];
    case "asignaciones":
      return [
        estado,
        course,
        {
          name: "materia",
          label: "Materia",
          all: "Todas",
          options: options.subjects,
        },
      ];
    default:
      return [estado];
  }
}

export function RecordDirectory({
  section,
  mode,
  base,
  listing,
  filters,
  options,
  page,
  highlight,
}: {
  section: ManagementSection;
  mode: ManagementMode;
  base: string;
  listing: Listing;
  filters: ManagementFilters;
  options: FilterOptions;
  page: number;
  highlight?: string;
}) {
  const selects = selectsFor(section, options);
  const pages = Math.max(1, Math.ceil(listing.total / PAGE_SIZE));
  const hidden = (["docente"] as const).filter((k) => filters[k]);
  const hasFilter = Object.values(filters).some(Boolean);
  const link = (p: number) => {
    const params = filtersToParams(filters);
    if (mode !== "buscar") params.set("modo", mode);
    if (p > 1) params.set("pagina", String(p));
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };
  const cleanHref = mode === "buscar" ? base : `${base}?modo=${mode}`;
  const modeQuery = mode === "buscar" ? "" : `&modo=${mode}`;
  const canToggle = mode === "desactivar" && section !== "matriculas";
  const columns = listing.columns;
  const [one, many] = noun[section];
  return (
    <>
      <Card className="mb-6 p-5">
        <form
          method="get"
          action={base}
          className="grid items-end gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto]"
        >
          {mode !== "buscar" && <input type="hidden" name="modo" value={mode} />}
          {hidden.map((k) => (
            <input key={k} type="hidden" name={k} value={filters[k]} />
          ))}
          <div>
            <label htmlFor="q" className="mb-2 block text-sm font-medium">
              Buscar
            </label>
            <Input
              id="q"
              name="q"
              defaultValue={filters.q}
              placeholder={placeholders[section]}
              maxLength={100}
            />
          </div>
          {selects.map((s) => (
            <div key={String(s.name)}>
              <label
                htmlFor={`f-${String(s.name)}`}
                className="mb-2 block text-sm font-medium"
              >
                {s.label}
              </label>
              <select
                id={`f-${String(s.name)}`}
                name={String(s.name)}
                defaultValue={filters[s.name]}
                className={selectClass}
              >
                <option value="">{s.all}</option>
                {s.options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <Button type="submit">
            <Search size={16} /> Buscar
          </Button>
        </form>
        {hasFilter && (
          <p className="mt-3 text-xs">
            <Link href={cleanHref} className="font-medium text-primary">
              Limpiar filtros
            </Link>
          </p>
        )}
      </Card>
      <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
        {listing.total} {listing.total === 1 ? one : many}
      </p>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <caption className="sr-only">{listing.title}</caption>
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                {columns.map((c) => (
                  <th key={c.key} scope="col" className="whitespace-nowrap px-5 py-3">
                    {c.label}
                  </th>
                ))}
                <th scope="col" className="px-5 py-3 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {listing.rows.map((row) => {
                const name = String(Object.values(row.cells)[0] ?? "registro");
                return (
                  <tr
                    key={row.id}
                    className={`border-t border-border align-middle ${highlight === row.id ? "bg-emerald-50/60" : ""}`}
                  >
                    {columns.map((c) => {
                      const value = row.cells[c.key];
                      return (
                        <td key={c.key} className="px-5 py-3">
                          {c.key === "status" ? (
                            <StatusBadge
                              value={String(value ?? "")}
                              active={row.active}
                            />
                          ) : c.key === columns[0].key ? (
                            <span className="font-medium">{value || "—"}</span>
                          ) : (
                            <span className="text-xs">{value || "—"}</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link
                            aria-label={`Ver ${name}`}
                            href={`${base}?ver=${row.id}${modeQuery}`}
                          >
                            <Eye size={14} /> Ver
                          </Link>
                        </Button>
                        {mode !== "desactivar" && (
                          <Button asChild size="sm" variant="outline">
                            <Link
                              aria-label={`Editar ${name}`}
                              href={`${base}?id=${row.id}`}
                            >
                              <Pencil size={14} /> Editar
                            </Link>
                          </Button>
                        )}
                        {canToggle && row.active !== undefined && (
                          <RecordToggle
                            section={section}
                            id={row.id}
                            active={row.active}
                            name={name}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!listing.rows.length && (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-5 py-10 text-center text-muted-foreground"
                  >
                    {hasFilter
                      ? "No hay registros con esos criterios."
                      : "Aún no hay registros. Usa «Crear» para comenzar."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border p-4 text-xs">
          <span>
            Página {page} de {pages}
          </span>
          <div className="flex gap-3">
            {page > 1 && (
              <Link className="text-primary" href={link(page - 1)}>
                Anterior
              </Link>
            )}
            {page < pages && (
              <Link className="text-primary" href={link(page + 1)}>
                Siguiente
              </Link>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}

function StatusBadge({ value, active }: { value: string; active?: boolean }) {
  const good = active ?? ["ACTIVA", "Activa", "Activo"].includes(value);
  const tone =
    value === "RETIRADA"
      ? "bg-amber-50 text-amber-800"
      : good
        ? "bg-emerald-50 text-emerald-800"
        : "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {value}
    </span>
  );
}
