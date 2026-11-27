import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, Pencil, Plus, Search } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { loadPanel } from "@/lib/data/live";
import { PanelShell } from "@/components/panel-shell";
import { PageTitle } from "@/components/page-title";
import { SubjectForm, SubjectToggle, type SubjectRow } from "@/components/subject-forms";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  canManage,
  modeLabels,
  searchTerm,
  uuidPattern,
} from "@/lib/management-validation";
import { fold } from "@/lib/user-validation";
import { cn } from "@/lib/utils";

type Query = Record<string, string | string[] | undefined>;
const text = (v: Query[string]) => (typeof v === "string" ? v : "");
const selectClass =
  "h-12 w-full rounded-lg border border-input bg-background px-3 text-sm";
const modes = ["buscar", "editar", "desactivar"] as const;

export default async function Asignaturas({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const { supabase, profile } = await requireProfile();
  const query = await searchParams;
  const admin = canManage(profile.rol);
  const model = await loadPanel();
  const id = text(query.id);
  const viewId = text(query.ver);
  if ((id && !uuidPattern.test(id)) || (viewId && !uuidPattern.test(viewId)))
    notFound();
  const creating = admin && text(query.nuevo) === "1";
  const requested = text(query.modo);
  const mode = admin && modes.some((m) => m === requested)
    ? (requested as (typeof modes)[number])
    : "buscar";
  const q = searchTerm(text(query.q));
  const estadoParam = text(query.estado);
  const estado =
    estadoParam === "activas" || estadoParam === "inactivas"
      ? estadoParam
      : mode === "desactivar"
        ? "activas"
        : "";
  const { data, error } = await supabase
    .from("asignaturas")
    .select("id,nombre,descripcion,activo,updated_at")
    .order("nombre");
  if (error) throw new Error("No se pudieron consultar las asignaturas.");
  const all: SubjectRow[] = data ?? [];
  const rows = all
    .filter((s) => (admin ? true : s.activo))
    .filter((s) => (estado === "activas" ? s.activo : estado === "inactivas" ? !s.activo : true))
    .filter((s) => !q || fold(`${s.nombre} ${s.descripcion ?? ""}`).includes(fold(q)));
  const editing = admin && Boolean(id) ? all.find((s) => s.id === id) : undefined;
  const viewing = viewId ? all.find((s) => s.id === viewId) : undefined;
  if ((id && admin && !editing) || (viewId && !viewing)) notFound();
  const activeTab = creating ? "crear" : editing ? "editar" : mode;
  const tabs = [
    { key: "buscar", label: modeLabels.buscar, href: "/panel/asignaturas" },
    { key: "crear", label: modeLabels.crear, href: "/panel/asignaturas?nuevo=1" },
    { key: "editar", label: modeLabels.editar, href: "/panel/asignaturas?modo=editar" },
    { key: "desactivar", label: modeLabels.desactivar, href: "/panel/asignaturas?modo=desactivar" },
  ];
  const modeQuery = mode === "buscar" ? "" : `&modo=${mode}`;
  return (
    <PanelShell model={model}>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs text-muted-foreground">Administrar asignaturas</p>
          {creating || editing ? (
            <h1 className="text-3xl font-semibold tracking-tight">
              {editing ? "Editar asignatura" : "Registrar asignatura"}
              <span className="text-primary">.</span>
            </h1>
          ) : viewing ? (
            <h1 className="text-3xl font-semibold tracking-tight">
              {viewing.nombre}
              <span className="text-primary">.</span>
            </h1>
          ) : (
            <PageTitle fallback="Asignaturas" />
          )}
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Catálogo de materias de la institución. Busca, consulta, edita o desactiva sin perder el historial.
          </p>
        </div>
        {admin && !creating && !editing && (
          <Button asChild>
            <Link href="/panel/asignaturas?nuevo=1">
              <Plus size={17} /> Nueva asignatura
            </Link>
          </Button>
        )}
      </div>
      {admin && (
        <nav className="mb-6 flex flex-wrap gap-1 border-b border-border" aria-label="Acciones de asignaturas">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              aria-current={t.key === activeTab ? "page" : undefined}
              className={cn(
                "-mb-px border-b-2 px-4 py-2 text-sm",
                t.key === activeTab
                  ? "border-primary font-semibold text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      )}
      {text(query.guardado) === "1" && (
        <p role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Asignatura guardada correctamente.
        </p>
      )}
      {creating || editing ? (
        <Card className="p-5 sm:p-7">
          <SubjectForm key={editing?.updated_at ?? "nueva"} subject={editing} />
        </Card>
      ) : viewing ? (
        <Card className="max-w-2xl p-5 sm:p-7">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${viewing.activo ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
          >
            {viewing.activo ? "Activa" : "Inactiva"}
          </span>
          <p className="mt-4 text-sm leading-6">{viewing.descripcion || "Sin descripción."}</p>
          <div className="mt-6 flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/panel/asignaturas">Volver a la búsqueda</Link>
            </Button>
            {admin && (
              <Button asChild size="sm">
                <Link href={`/panel/asignaturas?id=${viewing.id}`}>
                  <Pencil size={14} /> Editar
                </Link>
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          <Card className="mb-6 p-5">
            <form method="get" action="/panel/asignaturas" className="grid items-end gap-3 md:grid-cols-[minmax(0,2fr)_1fr_auto]">
              {mode !== "buscar" && <input type="hidden" name="modo" value={mode} />}
              <div>
                <label htmlFor="q" className="mb-2 block text-sm font-medium">Buscar por nombre o descripción</label>
                <Input id="q" name="q" defaultValue={text(query.q).slice(0, 100)} maxLength={100} placeholder="Ej.: Matemática" />
              </div>
              {admin && (
                <div>
                  <label htmlFor="estado" className="mb-2 block text-sm font-medium">Estado</label>
                  <select id="estado" name="estado" defaultValue={estado} className={selectClass}>
                    <option value="">Todas</option>
                    <option value="activas">Activas</option>
                    <option value="inactivas">Inactivas</option>
                  </select>
                </div>
              )}
              <Button type="submit"><Search size={16} /> Buscar</Button>
            </form>
          </Card>
          <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
            {rows.length} {rows.length === 1 ? "asignatura" : "asignaturas"}
          </p>
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3">Asignatura</th>
                  <th className="px-5 py-3">Descripción</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="border-t border-border align-middle">
                    <td className="px-5 py-3 font-medium">{s.nombre}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{s.descripcion || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${s.activo ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                        {s.activo ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link aria-label={`Ver ${s.nombre}`} href={`/panel/asignaturas?ver=${s.id}${modeQuery}`}>
                            <Eye size={14} /> Ver
                          </Link>
                        </Button>
                        {admin && mode !== "desactivar" && (
                          <Button asChild size="sm" variant="outline">
                            <Link aria-label={`Editar ${s.nombre}`} href={`/panel/asignaturas?id=${s.id}`}>
                              <Pencil size={14} /> Editar
                            </Link>
                          </Button>
                        )}
                        {admin && mode === "desactivar" && <SubjectToggle subject={s} />}
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                      No hay asignaturas con esos criterios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </PanelShell>
  );
}
