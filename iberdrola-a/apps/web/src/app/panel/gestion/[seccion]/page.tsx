import Link from "next/link";
import { PageTitle } from "@/components/page-title";
import { notFound } from "next/navigation";
import {
  Plus,
  ArrowLeft,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { loadPanel } from "@/lib/data/live";
import {
  loadManagement,
  loadRecord,
  loadStudentRelations,
  loadCourseYears,
  loadFilterOptions,
  fullName,
  managementLabels,
  assignmentHasRecords,
} from "@/lib/data/management";
import {
  isManagementSection,
  managementSections,
  canManage,
  uuidPattern,
  localToday,
  managementSingular,
  managementNewLabel,
  managementModes,
  modeLabels,
  parseFilters,
  type ManagementMode,
} from "@/lib/management-validation";
import { PanelShell } from "@/components/panel-shell";
import { ManagementForm, type FormField } from "@/components/management-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecordDirectory } from "@/components/record-directory";
import { RecordDetail, detailItems } from "@/components/record-detail";
import { cn } from "@/lib/utils";

const personFields: FormField[] = [
  { name: "nombres", label: "Nombres", required: true, maxLength: 120 },
  { name: "apellido_paterno", label: "Apellido paterno", maxLength: 120 },
  { name: "apellido_materno", label: "Apellido materno", maxLength: 120 },
  { name: "ci", label: "CI", maxLength: 40 },
  { name: "telefono", label: "Teléfono", maxLength: 40 },
  { name: "direccion", label: "Dirección", type: "textarea", maxLength: 500 },
];
const hiddenFields: FormField[] = ["id", "version", "persona_version"].map(
  (name) => ({ name, label: name, type: "hidden" }),
);
type Query = Record<string, string | string[] | undefined>;
const textParam = (v: Query[string]) => (typeof v === "string" ? v : "");

export default async function ManagementPage({
  params,
  searchParams,
}: {
  params: Promise<{ seccion: string }>;
  searchParams: Promise<Query>;
}) {
  const { seccion } = await params;
  if (!isManagementSection(seccion)) notFound();
  const { profile } = await requireProfile();
  const model = await loadPanel();
  if (!canManage(profile.rol))
    return (
      <PanelShell model={model} current="gestion">
        <Card className="p-7">
          <h1 className="text-2xl font-semibold">Acceso restringido</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            La gestión de fichas está disponible para Dirección y Secretaría.
          </p>
          <Button asChild className="mt-5">
            <Link href="/panel">Volver al resumen</Link>
          </Button>
        </Card>
      </PanelShell>
    );
  const query = await searchParams;
  const id = textParam(query.id);
  if (id && !uuidPattern.test(id)) notFound();
  const editing = Boolean(id) || textParam(query.nuevo) === "1";
  const viewId = textParam(query.ver);
  if (viewId && !uuidPattern.test(viewId)) notFound();
  const viewing = !editing && Boolean(viewId);
  const requestedMode = textParam(query.modo) as ManagementMode;
  const mode: ManagementMode =
    managementModes.includes(requestedMode) &&
    !(requestedMode === "desactivar" && seccion === "matriculas")
      ? requestedMode
      : "buscar";
  const base = `/panel/gestion/${seccion}`;
  const page = Math.max(
    1,
    Math.min(1000000, Number.parseInt(textParam(query.pagina), 10) || 1),
  );
  const courseFilter = textParam(query.curso),
    teacherFilter = textParam(query.docente);
  if (
    (courseFilter && !uuidPattern.test(courseFilter)) ||
    (teacherFilter && !uuidPattern.test(teacherFilter))
  )
    notFound();
  const filterQuery = new URLSearchParams();
  if (courseFilter) filterQuery.set("curso", courseFilter);
  if (teacherFilter) filterQuery.set("docente", teacherFilter);
  const filterSuffix = filterQuery.size ? `&${filterQuery}` : "";
  const filters = parseFilters(query, seccion, mode);
  const showList = !editing && !viewing;
  const [listing, filterOptions] = showList
    ? await Promise.all([
        loadManagement(seccion, filters.q, page, filters),
        loadFilterOptions(),
      ])
    : [null, null];
  const loaded = editing
    ? await loadRecord(seccion, id || null)
    : viewing
      ? await loadRecord(seccion, viewId)
      : null;
  if ((editing || viewing) && !loaded) notFound();
  if (viewing && !loaded?.defaults.id) notFound();
  const detail = viewing && loaded ? detailItems(seccion, loaded) : null;
  const defaults: Record<string, string> = { ...loaded?.defaults };
  const fields: FormField[] = [...hiddenFields];
  const selectedStudent = textParam(query.estudiante);
  let relatedStudent: Awaited<ReturnType<typeof loadRecord>> = null;
  if (editing && seccion === "matriculas" && !id && selectedStudent) {
    if (!uuidPattern.test(selectedStudent)) notFound();
    relatedStudent = await loadRecord("estudiantes", selectedStudent);
    if (!relatedStudent) notFound();
    defaults.estudiante_id = selectedStudent;
  }
  let assignmentLocked = false;
  if (
    seccion === "estudiantes" ||
    seccion === "tutores" ||
    seccion === "docentes"
  ) {
    if (seccion === "docentes" && !id) {
      defaults.persona_modo = "nueva";
      fields.push(
        {
          name: "persona_modo",
          label: "Datos personales",
          type: "select",
          required: true,
          options: [
            { id: "nueva", label: "Crear una ficha personal" },
            { id: "existente", label: "Usar una ficha personal existente" },
          ],
        },
        {
          name: "persona_id",
          label: "Persona",
          type: "picker",
          picker: "personas",
          required: true,
          when: { field: "persona_modo", value: "existente" },
        },
      );
      fields.push(
        ...personFields.map((f) => ({
          ...f,
          when: { field: "persona_modo" as const, value: "nueva" },
        })),
      );
    } else fields.push(...personFields);
    if (seccion === "docentes")
      fields.push({
        name: "especialidad",
        label: "Especialidad",
        maxLength: 200,
      });
    if (seccion === "estudiantes")
      fields.push(
        { name: "rude", label: "RUDE", maxLength: 40 },
        {
          name: "genero",
          label: "Género",
          type: "select",
          options: [
            { id: "M", label: "Masculino" },
            { id: "F", label: "Femenino" },
            { id: "NO_ESPECIFICADO", label: "No especificado" },
          ],
        },
        {
          name: "fecha_nacimiento",
          label: "Fecha de nacimiento",
          type: "date",
          min: "1900-01-01",
          max: localToday(),
        },
      );
    fields.push({ name: "activo", label: "Ficha activa", type: "checkbox" });
  } else if (seccion === "asignaciones" && editing) {
    const record = loaded?.record;
    const assignment = record && "docentes" in record ? record : null;
    const teacherName = fullName(assignment?.docentes?.personas || null);
    const courseName = assignment?.cursos
      ? `${assignment.cursos.grado_id}° ${assignment.cursos.paralelo} · ${assignment.cursos.gestiones?.anio}`
      : "";
    assignmentLocked = id ? await assignmentHasRecords(id) : false;
    if (!id && teacherFilter) {
      const teacher = await loadRecord("docentes", teacherFilter);
      if (!teacher) notFound();
      defaults.docente_id = teacherFilter;
      fields.push({
        name: "docente_id",
        label: "Docente",
        type: "picker",
        picker: "docentes",
        required: true,
        options: [
          {
            id: teacherFilter,
            label: [
              teacher.defaults.nombres,
              teacher.defaults.apellido_paterno,
              teacher.defaults.apellido_materno,
            ]
              .filter(Boolean)
              .join(" "),
          },
        ],
      });
    } else
      fields.push({
        name: "docente_id",
        label: "Docente",
        type: assignmentLocked ? "select" : "picker",
        picker: "docentes",
        required: true,
        readOnly: assignmentLocked,
        options: id ? [{ id: defaults.docente_id, label: teacherName }] : [],
      });
    if (!id && courseFilter) {
      const course = await loadRecord("cursos", courseFilter);
      if (!course) notFound();
      defaults.curso_id = courseFilter;
      fields.push({
        name: "curso_id",
        label: "Curso",
        type: "picker",
        picker: "cursos",
        required: true,
        options: [
          {
            id: courseFilter,
            label: `${course.defaults.grado_id}° ${course.defaults.paralelo}`,
          },
        ],
      });
    } else
      fields.push({
        name: "curso_id",
        label: "Curso",
        type: id ? "select" : "picker",
        picker: "cursos",
        required: true,
        readOnly: Boolean(id),
        options: id ? [{ id: defaults.curso_id, label: courseName }] : [],
      });
    fields.push(
      {
        name: "asignatura_id",
        label: "Materia",
        type: id ? "select" : "picker",
        picker: "asignaturas",
        required: true,
        readOnly: Boolean(id),
        options: id
          ? [
              {
                id: defaults.asignatura_id,
                label: assignment?.asignaturas?.nombre || "Materia",
              },
            ]
          : [],
      },
      { name: "activo", label: "Asignación activa", type: "checkbox" },
    );
  } else if (seccion === "cursos" && editing) {
    const years = await loadCourseYears();
    if (!id) defaults.gestion_id = years.find((y) => y.activo)?.id || "";
    fields.push(
      {
        name: "gestion_id",
        label: "Gestión",
        type: "select",
        required: true,
        readOnly: Boolean(id),
        options: years
          .filter((y) => y.activo || y.id === defaults.gestion_id)
          .map((y) => ({ id: y.id, label: String(y.anio) })),
      },
      {
        name: "grado_id",
        label: "Grado de primaria",
        type: "select",
        required: true,
        readOnly: Boolean(id),
        options: Array.from({ length: 6 }, (_, i) => ({
          id: String(i + 1),
          label: `${i + 1}° de primaria`,
        })),
      },
      {
        name: "paralelo",
        label: "Paralelo",
        maxLength: 2,
        required: true,
        readOnly: Boolean(id),
      },
      { name: "activo", label: "Curso activo", type: "checkbox" },
    );
  } else if (seccion === "matriculas" && editing) {
    const record = loaded?.record;
    const studentName =
      record && "estudiantes" in record
        ? fullName(record.estudiantes?.personas || null)
        : relatedStudent
          ? [
              relatedStudent.defaults.nombres,
              relatedStudent.defaults.apellido_paterno,
              relatedStudent.defaults.apellido_materno,
            ]
              .filter(Boolean)
              .join(" ")
          : "";
    const courseName =
      record && "cursos" in record && record.cursos
        ? `${record.cursos.grado_id}° ${record.cursos.paralelo}`
        : "";
    fields.push(
      {
        name: "estudiante_id",
        label: "Estudiante",
        type: id || selectedStudent ? "select" : "picker",
        picker: "estudiantes",
        readOnly: Boolean(id || selectedStudent),
        required: true,
        options: defaults.estudiante_id
          ? [{ id: defaults.estudiante_id, label: studentName }]
          : [],
      },
      {
        name: "curso_id",
        label: "Curso",
        type: id ? "select" : "picker",
        picker: "cursos",
        readOnly: Boolean(id),
        required: true,
        options: id ? [{ id: defaults.curso_id, label: courseName }] : [],
      },
      {
        name: "fecha_ingreso",
        label: "Fecha de ingreso",
        type: "date",
        required: true,
      },
      {
        name: "estado",
        label: "Estado de matrícula",
        type: "select",
        required: true,
        readOnly: !id,
        options: [
          { id: "ACTIVA", label: "Activa" },
          { id: "RETIRADA", label: "Retirada" },
          { id: "FINALIZADA", label: "Finalizada" },
        ],
      },
      { name: "fecha_salida", label: "Fecha de salida", type: "date" },
    );
  }
  const relationId = id || (viewing ? viewId : "");
  const relations =
    seccion === "estudiantes" && relationId
      ? await loadStudentRelations(relationId)
      : null;
  const tutorId = textParam(query.tutor);
  const selectedLink = relations?.links.find((l) => l.tutor_id === tutorId);
  const tabs: { key: ManagementMode | "crear"; label: string; href: string }[] =
    [
      { key: "buscar", label: modeLabels.buscar, href: base },
      { key: "crear", label: modeLabels.crear, href: `${base}?nuevo=1` },
      { key: "editar", label: modeLabels.editar, href: `${base}?modo=editar` },
      ...(seccion === "matriculas"
        ? []
        : [
            {
              key: "desactivar" as const,
              label: modeLabels.desactivar,
              href: `${base}?modo=desactivar`,
            },
          ]),
    ];
  const activeTab: ManagementMode | "crear" = editing
    ? id
      ? "editar"
      : "crear"
    : mode;
  return (
    <PanelShell model={model} current="gestion">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs text-muted-foreground">
            Gestión académica · Dirección y Secretaría
          </p>
          {editing ? (
            <h1 className="text-3xl font-semibold tracking-tight">
              {`${id ? "Editar" : "Registrar"} ${managementSingular[seccion]}`}
              <span className="text-primary">.</span>
            </h1>
          ) : viewing && detail ? (
            <h1 className="text-3xl font-semibold tracking-tight">
              {detail.title}
              <span className="text-primary">.</span>
            </h1>
          ) : (
            <PageTitle fallback={managementLabels[seccion]} />
          )}
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            {editing
              ? "Completa la ficha y guarda los cambios. Los campos con * son obligatorios."
              : viewing
                ? "Consulta los datos de la ficha. Usa Editar para modificarlos."
                : mode === "editar"
                  ? `Busca ${managementSingular[seccion] === "matrícula" ? "la" : "el"} ${managementSingular[seccion]} con los filtros y pulsa Editar.`
                  : mode === "desactivar"
                    ? "Una ficha desactivada conserva su historial y puedes reactivarla cuando quieras."
                    : "Busca por nombre, CI u otros datos, filtra la lista, consulta cada ficha y edítala."}
          </p>
        </div>
        {!editing && (
          <Button asChild>
            <Link href={`${base}?nuevo=1${filterSuffix}`}>
              <Plus size={17} />
              {managementNewLabel[seccion]}
            </Link>
          </Button>
        )}
        {editing && (
          <Button asChild variant="outline">
            <Link href={base}>
              <ArrowLeft size={16} />
              Volver a la lista
            </Link>
          </Button>
        )}
      </div>
      <nav
        className="mb-4 flex flex-wrap gap-2"
        aria-label="Secciones de gestión"
      >
        {managementSections.map((s) => (
          <Link
            key={s}
            href={`/panel/gestion/${s}`}
            aria-current={s === seccion ? "page" : undefined}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm",
              s === seccion
                ? "border-primary bg-primary text-white"
                : "border-border bg-white hover:bg-muted",
            )}
          >
            {managementLabels[s]}
          </Link>
        ))}
      </nav>
      <nav
        className="mb-6 flex flex-wrap gap-1 border-b border-border"
        aria-label="Acciones de la sección"
      >
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
      {textParam(query.guardado) === "1" && (
        <p
          role="status"
          className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          Registro guardado correctamente.
        </p>
      )}
      {showList &&
        seccion === "asignaciones" &&
        (courseFilter || teacherFilter) && (
          <p className="mb-4 text-sm text-muted-foreground">
            Asignaciones filtradas por{" "}
            {courseFilter && teacherFilter
              ? "curso y docente"
              : courseFilter
                ? "curso"
                : "docente"}
            .{" "}
            <Link href={base} className="text-primary">
              Ver todas
            </Link>
          </p>
        )}
      {showList && listing && filterOptions && (
        <RecordDirectory
          section={seccion}
          mode={mode}
          base={base}
          listing={listing}
          filters={filters}
          options={filterOptions}
          page={page}
          highlight={textParam(query.registro)}
        />
      )}
      {viewing && detail && (
        <RecordDetail
          title={detail.title}
          items={detail.items}
          active={detail.active}
          base={base}
          id={viewId}
        >
          {relations && (
            <div className="grid min-w-0 gap-6 xl:grid-cols-2">
              <Card className="p-5 sm:p-7">
                <h2 className="text-lg font-semibold">Tutores vinculados</h2>
                <ul className="mt-4 space-y-3">
                  {relations.links.map((l) => (
                    <li
                      key={l.tutor_id}
                      className="rounded-lg border border-border p-3 text-sm"
                    >
                      <p className="font-medium">
                        {fullName(l.tutores?.personas || null)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {l.parentesco} ·{" "}
                        {l.autorizado_consulta
                          ? "Consulta autorizada"
                          : "Consulta desactivada"}
                        {l.contacto_principal ? " · Contacto principal" : ""}
                      </p>
                    </li>
                  ))}
                </ul>
                {!relations.links.length && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Aún no tiene tutores vinculados.
                  </p>
                )}
              </Card>
              <Card className="p-5 sm:p-7">
                <h2 className="text-lg font-semibold">Matrículas</h2>
                <ul className="mt-4 space-y-3">
                  {relations.enrolments.map((m) => (
                    <li
                      key={m.id}
                      className="rounded-lg border border-border p-3 text-sm"
                    >
                      <p className="font-medium">
                        {m.cursos
                          ? `${m.cursos.grado_id}° ${m.cursos.paralelo}`
                          : "Curso"}{" "}
                        · {m.cursos?.gestiones?.anio}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {m.estado} · Ingreso {m.fecha_ingreso}
                        {m.fecha_salida ? ` · Salida ${m.fecha_salida}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
                {!relations.enrolments.length && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Aún no tiene matrículas.
                  </p>
                )}
              </Card>
            </div>
          )}
          {(seccion === "docentes" || seccion === "cursos") && (
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link
                  href={`/panel/gestion/asignaciones?${seccion === "docentes" ? "docente" : "curso"}=${viewId}`}
                >
                  Ver asignaciones
                </Link>
              </Button>
            </div>
          )}
        </RecordDetail>
      )}
      {editing && (
        <Card className="p-5 sm:p-7">
          <ManagementForm
            key={`${seccion}-${id || "nuevo"}-${defaults.version || ""}-${selectedStudent}-${teacherFilter}-${courseFilter}`}
            section={seccion}
            defaults={defaults}
            fields={fields}
            cancelHref={base}
            submitLabel={id ? "Guardar cambios" : "Registrar"}
          />
          <p className="mt-5 text-xs leading-6 text-muted-foreground">
            {seccion === "cursos"
              ? "Una vez creado, el curso conserva su gestión, grado y paralelo. Puedes activar o desactivar su disponibilidad."
              : seccion === "asignaciones"
                ? assignmentLocked
                  ? "Esta asignación ya tiene registros académicos: conserva el docente, curso y materia. Puedes cambiar su estado sin borrar el historial."
                  : "Curso y materia se conservan después del registro. Puedes cambiar el docente mientras la asignación no tenga horarios ni registros académicos. Solo se admite una asignación por curso y materia."
                : seccion === "docentes"
                  ? "Los datos personales pueden compartirse con otras fichas de la misma persona. Registrar un docente no crea su cuenta de inicio de sesión. Desactivarlo conserva las asignaciones y revoca su acceso operativo como docente."
                  : seccion === "matriculas"
                    ? "La fecha debe pertenecer al año del curso. Para retirar o finalizar, indica la fecha de salida. Para trasladar, cierra la matrícula anterior y registra otra sin superponer fechas."
                    : "La ficha se puede desactivar conservando sus relaciones e historial. Registrar una ficha no crea una cuenta de inicio de sesión."}
          </p>
          {id && (seccion === "docentes" || seccion === "cursos") && (
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link
                  href={`/panel/gestion/asignaciones?${seccion === "docentes" ? "docente" : "curso"}=${id}`}
                >
                  Ver asignaciones
                </Link>
              </Button>
              <Button asChild>
                <Link
                  href={`/panel/gestion/asignaciones?nuevo=1&${seccion === "docentes" ? "docente" : "curso"}=${id}`}
                >
                  Asignar materia
                </Link>
              </Button>
            </div>
          )}
        </Card>
      )}
      {relations && editing && id && (
        <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
          <Card className="min-w-0 p-5 sm:p-7">
            <h2 className="text-lg font-semibold">Tutores vinculados</h2>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Actualiza parentesco, permiso de consulta y contacto principal. El
              permiso se aplica cuando el tutor tiene su cuenta vinculada.
            </p>
            <ul className="my-5 space-y-3">
              {relations.links.map((l) => (
                <li
                  key={l.tutor_id}
                  className="rounded-lg border border-border p-3 text-sm"
                >
                  <p className="font-medium">
                    {fullName(l.tutores?.personas || null)}
                    {l.tutores?.activo ? "" : " · Inactivo"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {l.parentesco} ·{" "}
                    {l.autorizado_consulta
                      ? "Consulta autorizada"
                      : "Consulta desactivada"}
                    {l.contacto_principal ? " · Contacto principal" : ""}
                  </p>
                  <Link
                    className="mt-2 inline-block text-xs text-primary"
                    href={`${base}?id=${id}&tutor=${l.tutor_id}`}
                  >
                    Editar vínculo
                  </Link>
                </li>
              ))}
            </ul>
            {!relations.links.length && (
              <p className="my-4 text-sm text-muted-foreground">
                Aún no tiene tutores vinculados.
              </p>
            )}
            {defaults.activo === "on" ? (
              <ManagementForm
                key={selectedLink?.tutor_id || "nuevo-vinculo"}
                section="vinculos"
                defaults={{
                  estudiante_id: id,
                  tutor_id: selectedLink?.tutor_id || "",
                  parentesco: selectedLink?.parentesco || "",
                  autorizado_consulta: selectedLink
                    ? selectedLink.autorizado_consulta
                      ? "on"
                      : ""
                    : "on",
                  contacto_principal: selectedLink?.contacto_principal
                    ? "on"
                    : "",
                }}
                fields={[
                  {
                    name: "estudiante_id",
                    label: "Estudiante",
                    type: "hidden",
                  },
                  {
                    name: "tutor_id",
                    label: "Tutor",
                    type: "picker",
                    picker: "tutores",
                    required: true,
                    options: selectedLink
                      ? [
                          {
                            id: selectedLink.tutor_id,
                            label: fullName(
                              selectedLink.tutores?.personas || null,
                            ),
                          },
                        ]
                      : [],
                  },
                  {
                    name: "parentesco",
                    label: "Parentesco",
                    required: true,
                    maxLength: 80,
                  },
                  {
                    name: "autorizado_consulta",
                    label: "Autorizar consulta",
                    type: "checkbox",
                  },
                  {
                    name: "contacto_principal",
                    label: "Contacto principal",
                    type: "checkbox",
                  },
                ]}
                cancelHref={`${base}?id=${id}`}
                submitLabel={
                  selectedLink ? "Actualizar vínculo" : "Vincular tutor"
                }
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Reactiva el estudiante para agregar o actualizar vínculos.
              </p>
            )}
          </Card>
          <Card className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Matrículas</h2>
              {defaults.activo === "on" && (
                <Button asChild size="sm">
                  <Link
                    href={`/panel/gestion/matriculas?nuevo=1&estudiante=${id}`}
                  >
                    <Plus size={14} />
                    Matricular
                  </Link>
                </Button>
              )}
            </div>
            <ul className="mt-5 space-y-3">
              {relations.enrolments.map((m) => (
                <li
                  key={m.id}
                  className="rounded-lg border border-border p-3 text-sm"
                >
                  <p className="font-medium">
                    {m.cursos
                      ? `${m.cursos.grado_id}° ${m.cursos.paralelo}`
                      : "Curso"}{" "}
                    · {m.cursos?.gestiones?.anio}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {m.estado} · Ingreso {m.fecha_ingreso}
                    {m.fecha_salida ? ` · Salida ${m.fecha_salida}` : ""}
                  </p>
                  <Link
                    className="mt-2 inline-block text-xs text-primary"
                    href={`/panel/gestion/matriculas?id=${m.id}`}
                  >
                    Editar matrícula
                  </Link>
                </li>
              ))}
            </ul>
            {!relations.enrolments.length && (
              <p className="mt-5 text-sm text-muted-foreground">
                Aún no tiene matrículas.
              </p>
            )}
          </Card>
        </div>
      )}
    </PanelShell>
  );
}
