import "server-only";
import { requireProfile } from "@/lib/auth";
import {
  canManage,
  searchTerm,
  type ManagementFilters,
  type ManagementSection,
} from "@/lib/management-validation";
import type { Listing } from "./model";

export const managementLabels = {
  estudiantes: "Estudiantes",
  tutores: "Tutores",
  cursos: "Cursos",
  matriculas: "Matrículas",
  docentes: "Docentes",
  asignaciones: "Asignaciones",
};
export type Person = {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  ci: string | null;
  telefono: string | null;
  direccion: string | null;
  updated_at: string;
};
export const fullName = (
  p: Pick<Person, "nombres" | "apellido_paterno" | "apellido_materno"> | null,
) =>
  p
    ? [p.nombres, p.apellido_paterno, p.apellido_materno]
        .filter(Boolean)
        .join(" ")
    : "Ficha no disponible";
function check<T extends { error: unknown }>(value: T): T {
  if (value.error)
    throw new Error("No se pudieron consultar los registros de gestión.");
  return value;
}
const NIL = "00000000-0000-0000-0000-000000000000";
const PAGE_SIZE = 25;
export type ListFilters = Partial<
  Pick<
    ManagementFilters,
    "estado" | "curso" | "docente" | "gestion" | "grado" | "materia" | "genero"
  >
>;
const generos: Record<string, string> = {
  M: "Masculino",
  F: "Femenino",
  NO_ESPECIFICADO: "No especificado",
};
const courseLabel = (
  c: { grado_id: number; paralelo: string } | null | undefined,
) => (c ? `${c.grado_id}° ${c.paralelo}` : "—");
type Db = Awaited<ReturnType<typeof requireProfile>>["supabase"];
/** Cursos de una gestión o de un grado; `null` si no hay filtro. */
async function courseIdsFor(
  supabase: Db,
  filters: ListFilters,
): Promise<string[] | null> {
  if (!filters.gestion && !filters.grado) return null;
  let request = supabase.from("cursos").select("id").limit(1000);
  if (filters.gestion) request = request.eq("gestion_id", filters.gestion);
  if (filters.grado) request = request.eq("grado_id", Number(filters.grado));
  const ids = (check(await request).data || []).map((c) => c.id);
  return ids.length ? ids : [NIL];
}
export async function loadManagement(
  section: ManagementSection,
  query: string,
  page: number,
  filters: ListFilters = {},
): Promise<Listing | null> {
  const { supabase, profile } = await requireProfile();
  if (!canManage(profile.rol)) return null;
  const term = searchTerm(query);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const personSearch = `nombres.ilike.%${term}%,apellido_paterno.ilike.%${term}%,apellido_materno.ilike.%${term}%,ci.ilike.%${term}%`;
  const active =
    filters.estado === "activos"
      ? true
      : filters.estado === "inactivos"
        ? false
        : null;
  if (
    section === "estudiantes" ||
    section === "tutores" ||
    section === "docentes"
  ) {
    let request = supabase
      .from(section)
      .select("*,personas!inner(*)", { count: "exact" })
      .order("created_at", { ascending: false })
      .order("id")
      .range(from, to);
    if (term) request = request.or(personSearch, { referencedTable: "personas" });
    if (active !== null) request = request.eq("activo", active);
    if (section === "estudiantes") {
      if (filters.genero) request = request.eq("genero", filters.genero);
      if (filters.curso || filters.gestion || filters.grado) {
        const courses = filters.curso
          ? [filters.curso]
          : await courseIdsFor(supabase, filters);
        const enrolled = check(
          await supabase
            .from("matriculas")
            .select("estudiante_id")
            .eq("estado", "ACTIVA")
            .in("curso_id", courses && courses.length ? courses : [NIL])
            .limit(5000),
        ).data;
        const ids = Array.from(new Set((enrolled || []).map((m) => m.estudiante_id)));
        request = request.in("id", ids.length ? ids : [NIL]);
      }
    }
    const result = check(await request);
    const label =
      section === "estudiantes"
        ? "Estudiante"
        : section === "docentes"
          ? "Docente"
          : "Tutor";
    const extra: Listing["columns"] =
      section === "estudiantes"
        ? [
            { key: "rude", label: "RUDE" },
            { key: "genero", label: "Género" },
          ]
        : section === "docentes"
          ? [{ key: "especialidad", label: "Especialidad" }]
          : [{ key: "telefono", label: "Teléfono" }];
    return {
      title: managementLabels[section],
      description: "Fichas activas e inactivas.",
      total: result.count || 0,
      columns: [
        { key: "name", label },
        { key: "ci", label: "CI" },
        ...extra,
        { key: "status", label: "Estado" },
      ],
      rows: (result.data || []).map((r) => ({
        id: r.id,
        active: r.activo,
        cells: {
          name: fullName(r.personas),
          ci: r.personas.ci,
          rude: "rude" in r ? r.rude : null,
          genero: "genero" in r && r.genero ? generos[r.genero] || r.genero : null,
          especialidad: "especialidad" in r ? r.especialidad : null,
          telefono: r.personas.telefono,
          status: r.activo ? "Activo" : "Inactivo",
        },
      })),
    };
  }
  if (section === "asignaciones") {
    let request = supabase
      .from("asignaciones_docente")
      .select(
        "*,docentes!inner(personas!inner(nombres,apellido_paterno,apellido_materno)),cursos(grado_id,paralelo,gestiones(anio)),asignaturas(nombre)",
        { count: "exact" },
      )
      .order("updated_at", { ascending: false })
      .order("id")
      .range(from, to);
    if (term)
      request = request.or(
        `nombres.ilike.%${term}%,apellido_paterno.ilike.%${term}%,apellido_materno.ilike.%${term}%`,
        { referencedTable: "docentes.personas" },
      );
    if (filters.curso) request = request.eq("curso_id", filters.curso);
    if (filters.docente) request = request.eq("docente_id", filters.docente);
    if (filters.materia) request = request.eq("asignatura_id", filters.materia);
    if (active !== null) request = request.eq("activo", active);
    if (!filters.curso) {
      const courses = await courseIdsFor(supabase, filters);
      if (courses) request = request.in("curso_id", courses);
    }
    const result = check(await request);
    return {
      title: "Asignaciones",
      description: "Docentes responsables por curso y materia.",
      total: result.count || 0,
      columns: [
        { key: "teacher", label: "Docente" },
        { key: "subject", label: "Materia" },
        { key: "course", label: "Curso" },
        { key: "year", label: "Gestión" },
        { key: "status", label: "Estado" },
      ],
      rows: (result.data || []).map((a) => ({
        id: a.id,
        active: a.activo,
        cells: {
          teacher: fullName(a.docentes.personas),
          subject: a.asignaturas?.nombre || "—",
          course: courseLabel(a.cursos),
          year: a.cursos?.gestiones?.anio || "—",
          status: a.activo ? "Activa" : "Inactiva",
        },
      })),
    };
  }
  if (section === "cursos") {
    let request = supabase
      .from("cursos")
      .select("*,gestiones(anio)", { count: "exact" })
      .order("gestion_id")
      .order("grado_id")
      .order("paralelo")
      .range(from, to);
    if (term) request = request.ilike("paralelo", `%${term}%`);
    if (active !== null) request = request.eq("activo", active);
    if (filters.gestion) request = request.eq("gestion_id", filters.gestion);
    if (filters.grado) request = request.eq("grado_id", Number(filters.grado));
    const result = check(await request);
    return {
      title: "Cursos",
      description: "Cursos de todas las gestiones.",
      total: result.count || 0,
      columns: [
        { key: "course", label: "Curso" },
        { key: "year", label: "Gestión" },
        { key: "status", label: "Estado" },
      ],
      rows: (result.data || []).map((r) => ({
        id: r.id,
        active: r.activo,
        cells: {
          course: courseLabel(r),
          year: r.gestiones?.anio || "—",
          status: r.activo ? "Activo" : "Inactivo",
        },
      })),
    } satisfies Listing;
  }
  let request = supabase
    .from("matriculas")
    .select(
      "*,estudiantes!inner(personas!inner(nombres,apellido_paterno,apellido_materno,ci)),cursos(grado_id,paralelo,gestiones(anio))",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false })
    .order("id")
    .range(from, to);
  if (term)
    request = request.or(personSearch, {
      referencedTable: "estudiantes.personas",
    });
  if (filters.estado && ["ACTIVA", "RETIRADA", "FINALIZADA"].includes(filters.estado))
    request = request.eq("estado", filters.estado);
  if (filters.curso) request = request.eq("curso_id", filters.curso);
  else {
    const courses = await courseIdsFor(supabase, filters);
    if (courses) request = request.in("curso_id", courses);
  }
  const result = check(await request);
  return {
    title: "Matrículas",
    description: "Ingreso, retiro y finalización por gestión.",
    total: result.count || 0,
    columns: [
      { key: "student", label: "Estudiante" },
      { key: "course", label: "Curso" },
      { key: "year", label: "Gestión" },
      { key: "entry", label: "Ingreso" },
      { key: "status", label: "Estado" },
    ],
    rows: (result.data || []).map((r) => ({
      id: r.id,
      cells: {
        student: fullName(r.estudiantes.personas),
        course: courseLabel(r.cursos),
        year: r.cursos?.gestiones?.anio || "—",
        entry: r.fecha_ingreso,
        status: r.estado,
      },
    })),
  } satisfies Listing;
}

/** Opciones para los filtros de las listas (gestiones, cursos y materias). */
export async function loadFilterOptions() {
  const { supabase, profile } = await requireProfile();
  if (!canManage(profile.rol))
    return { years: [], courses: [], subjects: [] } as FilterOptions;
  const [years, courses, subjects] = await Promise.all([
    supabase.from("gestiones").select("id,anio").order("anio", { ascending: false }),
    supabase
      .from("cursos")
      .select("id,grado_id,paralelo,gestiones(anio)")
      .order("grado_id")
      .order("paralelo")
      .limit(300),
    supabase.from("asignaturas").select("id,nombre").order("nombre"),
  ]);
  return {
    years: check(years).data?.map((y) => ({ id: y.id, label: String(y.anio) })) || [],
    courses:
      check(courses).data?.map((c) => ({
        id: c.id,
        label: `${c.grado_id}° ${c.paralelo} · ${c.gestiones?.anio ?? ""}`,
      })) || [],
    subjects: check(subjects).data?.map((a) => ({ id: a.id, label: a.nombre })) || [],
  } as FilterOptions;
}
export type FilterOptions = {
  years: { id: string; label: string }[];
  courses: { id: string; label: string }[];
  subjects: { id: string; label: string }[];
};

const pack = <T>(defaults: Record<string, string>, record: T) => ({
  defaults,
  record,
});
export async function loadRecord(
  section: ManagementSection,
  id: string | null,
) {
  const { supabase, profile } = await requireProfile();
  if (!canManage(profile.rol)) return null;
  if (
    section === "estudiantes" ||
    section === "tutores" ||
    section === "docentes"
  ) {
    if (!id) return pack({ activo: "on" }, null);
    const result = check(
      await supabase
        .from(section)
        .select("*,personas(*)")
        .eq("id", id)
        .maybeSingle(),
    );
    if (!result.data?.personas) return null;
    const r = result.data,
      p = r.personas!;
    const defaults: Record<string, string> = {
      id: r.id,
      version: r.updated_at,
      persona_version: p.updated_at,
      nombres: p.nombres,
      apellido_paterno: p.apellido_paterno,
      apellido_materno: p.apellido_materno,
      ci: p.ci || "",
      telefono: p.telefono || "",
      direccion: p.direccion || "",
      activo: r.activo ? "on" : "",
    };
    if ("rude" in r)
      Object.assign(defaults, {
        rude: r.rude || "",
        genero: r.genero || "",
        fecha_nacimiento: r.fecha_nacimiento || "",
      });
    if ("especialidad" in r)
      Object.assign(defaults, { especialidad: r.especialidad || "" });
    return pack(defaults, r);
  }
  if (section === "asignaciones") {
    if (!id) return pack({ activo: "on" }, null);
    const r = check(
      await supabase
        .from("asignaciones_docente")
        .select(
          "*,docentes(personas(nombres,apellido_paterno,apellido_materno)),cursos(grado_id,paralelo,gestiones(anio)),asignaturas(nombre)",
        )
        .eq("id", id)
        .maybeSingle(),
    ).data;
    return r
      ? pack(
          {
            id: r.id,
            version: r.updated_at,
            docente_id: r.docente_id,
            curso_id: r.curso_id,
            asignatura_id: r.asignatura_id,
            activo: r.activo ? "on" : "",
          },
          r,
        )
      : null;
  }
  if (section === "cursos") {
    if (!id) return pack({ activo: "on" }, null);
    const r = check(
      await supabase
        .from("cursos")
        .select("*,gestiones(anio)")
        .eq("id", id)
        .maybeSingle(),
    ).data;
    return r
      ? pack(
          {
            id: r.id,
            version: r.updated_at,
            gestion_id: r.gestion_id,
            grado_id: String(r.grado_id),
            paralelo: r.paralelo,
            activo: r.activo ? "on" : "",
          },
          r,
        )
      : null;
  }
  if (!id) return pack({ estado: "ACTIVA" }, null);
  const r = check(
    await supabase
      .from("matriculas")
      .select(
        "*,estudiantes(personas(nombres,apellido_paterno,apellido_materno)),cursos(grado_id,paralelo,gestiones(anio))",
      )
      .eq("id", id)
      .maybeSingle(),
  ).data;
  return r
    ? pack(
        {
          id: r.id,
          version: r.updated_at,
          estudiante_id: r.estudiante_id,
          curso_id: r.curso_id,
          fecha_ingreso: r.fecha_ingreso,
          fecha_salida: r.fecha_salida || "",
          estado: r.estado,
        },
        r,
      )
    : null;
}

export async function loadStudentRelations(id: string) {
  const { supabase, profile } = await requireProfile();
  if (!canManage(profile.rol)) return null;
  const [links, enrolments] = await Promise.all([
    supabase
      .from("estudiante_tutor")
      .select(
        "*,tutores(activo,personas(nombres,apellido_paterno,apellido_materno))",
      )
      .eq("estudiante_id", id)
      .order("contacto_principal", { ascending: false }),
    supabase
      .from("matriculas")
      .select(
        "id,estado,fecha_ingreso,fecha_salida,cursos(grado_id,paralelo,gestiones(anio))",
      )
      .eq("estudiante_id", id)
      .order("fecha_ingreso", { ascending: false }),
  ]);
  return {
    links: check(links).data || [],
    enrolments: check(enrolments).data || [],
  };
}

export async function loadCourseYears() {
  const { supabase, profile } = await requireProfile();
  if (!canManage(profile.rol)) return [];
  return (
    check(
      await supabase
        .from("gestiones")
        .select("id,anio,activo")
        .order("anio", { ascending: false }),
    ).data || []
  );
}

export async function assignmentHasRecords(id: string) {
  const { supabase, profile } = await requireProfile();
  if (!canManage(profile.rol)) return true;
  const results = await Promise.all(
    [
      "horarios",
      "criterios_evaluacion",
      "calificaciones_trimestrales",
      "avances_curriculares",
      "observaciones_estudiantes",
    ].map((table) =>
      supabase
        .from(
          table as
            | "horarios"
            | "criterios_evaluacion"
            | "calificaciones_trimestrales"
            | "avances_curriculares"
            | "observaciones_estudiantes",
        )
        .select("id", { count: "exact", head: true })
        .eq("asignacion_docente_id", id),
    ),
  );
  results.forEach(check);
  return results.some((r) => (r.count || 0) > 0);
}
