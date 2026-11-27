import Link from "next/link";
import { PageTitle } from "@/components/page-title";
import { requireProfile } from "@/lib/auth";
import { loadPanel } from "@/lib/data/live";
import { loadScheduleCourses } from "@/lib/data/schedule";
import { loadReport } from "@/lib/data/reports";
import { PanelShell } from "@/components/panel-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportTable } from "@/components/report-table";
import {
  SaveCurrentReport,
  SavedReportList,
  type SavedReport,
} from "@/components/saved-reports";
import { displayDate } from "@/lib/data/model";
const field =
  "mt-2 h-12 w-full rounded-lg border border-input bg-background px-3 text-sm";
export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireProfile(),
    model = await loadPanel(),
    courses = await loadScheduleCourses();
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(await searchParams))
    if (typeof v === "string") params.set(k, v);
  const terms = await supabase
    .from("trimestres")
    .select("id,numero,gestiones(anio)")
    .order("numero")
    .limit(501);
  const optionsError = !!terms.error || (terms.data?.length || 0) > 500;
  const result = params.has("curso") ? await loadReport(params) : null;
  // Informes guardados de la cuenta (solo filtros, nunca datos).
  const saved = await supabase
    .from("reportes_guardados")
    .select("id,nombre,parametros,updated_at")
    .order("updated_at", { ascending: false })
    .limit(200);
  const savedAvailable = !saved.error;
  const courseLabel = new Map(courses.map((c) => [c.id, c.label]));
  const termLabel = new Map(
    (terms.data || []).map((t) => [
      t.id,
      `Trimestre ${t.numero} · ${t.gestiones?.anio ?? ""}`,
    ]),
  );
  const savedReports: SavedReport[] = (saved.data || []).map((r) => {
    const p = new URLSearchParams(r.parametros);
    const tipo = p.get("tipo") || "calificaciones";
    return {
      id: r.id,
      nombre: r.nombre,
      parametros: r.parametros,
      fecha: displayDate(r.updated_at),
      detalle: [
        tipo === "asistencia" ? "Asistencia" : "Calificaciones",
        courseLabel.get(p.get("curso") || "") || "Curso no disponible",
        tipo === "asistencia"
          ? `${p.get("desde")} a ${p.get("hasta")}`
          : termLabel.get(p.get("trimestre") || "") || "",
      ]
        .filter(Boolean)
        .join(" · "),
    };
  });
  const openId = params.get("guardado") || "";
  const openReport = savedReports.find((r) => r.id === openId);
  const reportQuery = new URLSearchParams(params);
  reportQuery.delete("guardado");
  return (
    <PanelShell model={model} current="informes">
      <div className="mb-7">
        <p className="mb-2 text-xs text-muted-foreground">
          Consulta y exportación
        </p>
        <PageTitle fallback="Informes académicos" />
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Consulta calificaciones publicadas o asistencia por curso. Descarga
          los resultados o prepara una copia para imprimir.
        </p>
      </div>
      <Card className="mb-6 p-5">
        {optionsError ? (
          <p role="alert">
            No se pudieron cargar los trimestres o se superó el límite de 500
            opciones.
          </p>
        ) : (
          <form
            action="/panel/informes"
            method="get"
            className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <label className="text-sm">
              Tipo de informe
              <select
                name="tipo"
                aria-label="Tipo de informe"
                defaultValue={params.get("tipo") || "calificaciones"}
                className={field}
              >
                <option value="calificaciones">
                  Calificaciones publicadas
                </option>
                <option value="asistencia">Resumen de asistencia</option>
              </select>
            </label>
            <label className="text-sm">
              Curso
              <select
                name="curso"
                aria-label="Curso"
                required
                defaultValue={params.get("curso") || ""}
                className={field}
              >
                <option value="">Selecciona un curso</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Trimestre (calificaciones)
              <select
                name="trimestre"
                aria-label="Trimestre (calificaciones)"
                defaultValue={params.get("trimestre") || ""}
                className={field}
              >
                <option value="">Selecciona un trimestre</option>
                {terms.data?.map((t) => (
                  <option key={t.id} value={t.id}>
                    Trimestre {t.numero} · {t.gestiones?.anio}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Desde (asistencia)
              <input
                type="date"
                name="desde"
                defaultValue={params.get("desde") || ""}
                className={field}
              />
            </label>
            <label className="text-sm">
              Hasta (asistencia)
              <input
                type="date"
                name="hasta"
                defaultValue={params.get("hasta") || ""}
                className={field}
              />
            </label>
            <Button>Generar informe</Button>
            <p className="text-xs leading-6 text-muted-foreground sm:col-span-2 lg:col-span-3">
              Para calificaciones, elige un trimestre de la misma gestión del
              curso. Para asistencia, indica las fechas dentro del año de la
              gestión. Los otros filtros se ignoran.
            </p>
          </form>
        )}
      </Card>
      {result?.error && (
        <p role="alert" className="mb-5 rounded-lg border p-4 text-sm">
          {result.error}
        </p>
      )}
      {result?.report && (
        <Card className="min-w-0 p-5">
          <div className="mb-6 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <a href={`/panel/informes/csv?${reportQuery}`}>Descargar CSV</a>
            </Button>
            <Button asChild>
              <Link href={`/panel/informes/imprimir?${reportQuery}`}>
                Preparar impresión / PDF
              </Link>
            </Button>
          </div>
          <div className="mb-6 rounded-xl border border-border bg-muted/40 p-4">
            {savedAvailable ? (
              <SaveCurrentReport
                params={reportQuery.toString()}
                openId={openReport?.id}
                openName={openReport?.nombre}
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                Para guardar informes, ejecuta en Supabase el archivo
                supabase/migrations/202611270001_ampliacion_modulos.sql.
              </p>
            )}
          </div>
          <ReportTable report={result.report} />
          <p className="mt-5 text-xs leading-6 text-muted-foreground">
            La descarga y la impresión vuelven a consultar los datos; pueden
            reflejar publicaciones o retiros posteriores a esta vista. Se
            exportan todas las filas del informe, hasta 5000, sin truncarlas.
          </p>
        </Card>
      )}
      {savedAvailable && (
        <Card className="mt-6 p-5">
          <h2 className="mb-4 text-lg font-semibold">Informes guardados</h2>
          <SavedReportList reports={savedReports} />
        </Card>
      )}
      {!result && (
        <Card className="mt-6 p-8 text-sm text-muted-foreground">
          Selecciona los filtros para generar tu primer informe. La consulta no
          modifica calificaciones ni asistencia.
        </Card>
      )}
    </PanelShell>
  );
}
