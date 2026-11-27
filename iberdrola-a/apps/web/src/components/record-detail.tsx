import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { fullName, type loadRecord } from "@/lib/data/management";
import type { ManagementSection } from "@/lib/management-validation";
import { displayDate } from "@/lib/data/model";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Loaded = NonNullable<Awaited<ReturnType<typeof loadRecord>>>;
type Item = { label: string; value: string };
const generos: Record<string, string> = {
  M: "Masculino",
  F: "Femenino",
  NO_ESPECIFICADO: "No especificado",
};
const course = (c: { grado_id: number; paralelo: string } | null | undefined) =>
  c ? `${c.grado_id}° ${c.paralelo}` : "—";

/** Datos de solo lectura de una ficha, según la sección. */
export function detailItems(
  section: ManagementSection,
  { defaults: d, record }: Loaded,
): { title: string; items: Item[]; active: boolean | null } {
  if (section === "estudiantes" || section === "tutores" || section === "docentes") {
    const items: Item[] = [
      { label: "Nombres", value: d.nombres },
      {
        label: "Apellidos",
        value: [d.apellido_paterno, d.apellido_materno].filter(Boolean).join(" "),
      },
      { label: "CI", value: d.ci },
      { label: "Teléfono", value: d.telefono },
      { label: "Dirección", value: d.direccion },
    ];
    if (section === "estudiantes")
      items.push(
        { label: "RUDE", value: d.rude },
        { label: "Género", value: generos[d.genero] || d.genero },
        {
          label: "Fecha de nacimiento",
          value: d.fecha_nacimiento ? displayDate(d.fecha_nacimiento) : "",
        },
      );
    if (section === "docentes")
      items.push({ label: "Especialidad", value: d.especialidad });
    return {
      title: [d.nombres, d.apellido_paterno, d.apellido_materno]
        .filter(Boolean)
        .join(" "),
      items,
      active: d.activo === "on",
    };
  }
  if (section === "cursos") {
    const r = record && "gestiones" in record ? record : null;
    return {
      title: r ? `Curso ${course(r)}` : "Curso",
      items: [
        { label: "Gestión", value: String(r?.gestiones?.anio ?? "") },
        { label: "Grado", value: d.grado_id ? `${d.grado_id}° de primaria` : "" },
        { label: "Paralelo", value: d.paralelo },
      ],
      active: d.activo === "on",
    };
  }
  if (section === "asignaciones") {
    const r = record && "docentes" in record ? record : null;
    return {
      title: r?.asignaturas?.nombre || "Asignación",
      items: [
        { label: "Docente", value: fullName(r?.docentes?.personas || null) },
        { label: "Materia", value: r?.asignaturas?.nombre || "" },
        { label: "Curso", value: course(r?.cursos) },
        { label: "Gestión", value: String(r?.cursos?.gestiones?.anio ?? "") },
      ],
      active: d.activo === "on",
    };
  }
  const r = record && "estudiantes" in record ? record : null;
  return {
    title: fullName(r?.estudiantes?.personas || null),
    items: [
      { label: "Estudiante", value: fullName(r?.estudiantes?.personas || null) },
      { label: "Curso", value: course(r?.cursos) },
      { label: "Gestión", value: String(r?.cursos?.gestiones?.anio ?? "") },
      { label: "Estado", value: d.estado },
      { label: "Fecha de ingreso", value: d.fecha_ingreso ? displayDate(d.fecha_ingreso) : "" },
      { label: "Fecha de salida", value: d.fecha_salida ? displayDate(d.fecha_salida) : "" },
    ],
    active: null,
  };
}

export function RecordDetail({
  title,
  items,
  active,
  base,
  id,
  children,
}: {
  title: string;
  items: Item[];
  active: boolean | null;
  base: string;
  id: string;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-7">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {active !== null && (
              <span
                className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
              >
                {active ? "Activo" : "Inactivo"}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={base}>
                <ArrowLeft size={14} /> Volver a la búsqueda
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href={`${base}?id=${id}`}>
                <Pencil size={14} /> Editar
              </Link>
            </Button>
          </div>
        </div>
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {items.map((i) => (
            <div key={i.label}>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                {i.label}
              </dt>
              <dd className="mt-1 text-sm">{i.value || "—"}</dd>
            </div>
          ))}
        </dl>
      </Card>
      {children}
    </div>
  );
}
