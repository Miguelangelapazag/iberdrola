import type { Module, Role } from "@iberdrola/shared";
export function panelHref(
  model: { demo: boolean; role: Role },
  module?: Module,
) {
  return model.demo
    ? `/demo${module ? `/${module}` : ""}?rol=${model.role}`
    : `/panel${module ? `/${module}` : ""}`;
}

export type NavIcon =
  | "inicio"
  | "cuenta"
  | "comunicados"
  | "usuarios"
  | "estudiantes"
  | "docentes"
  | "asignaturas"
  | "horarios"
  | "asistencia"
  | "calificaciones"
  | "reportes";
export type NavItem = {
  label: string;
  /** Ruta de la sesión real. */
  href: string;
  /** Ruta equivalente en la demostración; si falta, el elemento no se muestra en la demo. */
  demo?: string;
  /** Solo Dirección y Secretaría. */
  manage?: boolean;
  /** Solo estos roles. */
  roles?: readonly Role[];
  /** Etiqueta alternativa según el rol (por ejemplo "Mis hijos"). */
  roleLabels?: Partial<Record<Role, string>>;
};
export type NavGroup = {
  id: string;
  /** Número de sprint de la planificación; los grupos sin número no pertenecen a un sprint. */
  sprint?: number;
  label: string;
  icon: NavIcon;
  items: NavItem[];
};
export const navGroups: NavGroup[] = [
  {
    id: "inicio",
    label: "Inicio",
    icon: "inicio",
    items: [{ label: "Resumen", href: "/panel", demo: "/demo" }],
  },
  {
    id: "usuarios",
    sprint: 1,
    label: "Gestión de Usuarios",
    icon: "usuarios",
    items: [
      { label: "Crear usuario", href: "/panel/usuarios/nuevo", roles: ["DIRECTOR"] },
      { label: "Buscar usuarios", href: "/panel/usuarios", roles: ["DIRECTOR"] },
      { label: "Editar usuario", href: "/panel/usuarios/editar", roles: ["DIRECTOR"] },
      { label: "Desactivar usuarios", href: "/panel/usuarios/desactivar", roles: ["DIRECTOR"] },
    ],
  },
  {
    id: "estudiantes",
    sprint: 2,
    label: "Registro de Estudiantes",
    icon: "estudiantes",
    items: [
      {
        label: "Estudiantes",
        href: "/panel/estudiantes",
        demo: "/demo/estudiantes",
        roleLabels: { PADRE: "Mis hijos", ESTUDIANTE: "Mi ficha" },
      },
      { label: "Fichas de estudiantes", href: "/panel/gestion/estudiantes", manage: true },
      { label: "Tutores y responsables", href: "/panel/gestion/tutores", manage: true },
      { label: "Cursos", href: "/panel/cursos", demo: "/demo/cursos" },
      { label: "Administrar cursos", href: "/panel/gestion/cursos", manage: true },
      { label: "Matrículas", href: "/panel/gestion/matriculas", manage: true },
    ],
  },
  {
    id: "docentes",
    sprint: 3,
    label: "Gestión de Docentes",
    icon: "docentes",
    items: [
      { label: "Fichas de docentes", href: "/panel/gestion/docentes", manage: true },
    ],
  },
  {
    id: "asignaturas",
    sprint: 4,
    label: "Administrar Asignaturas",
    icon: "asignaturas",
    items: [
      { label: "Asignación de materias", href: "/panel/gestion/asignaciones", manage: true },
    ],
  },
  {
    id: "horarios",
    sprint: 5,
    label: "Control de Horarios",
    icon: "horarios",
    items: [
      { label: "Registros de horarios", href: "/panel/horarios", demo: "/demo/horarios" },
      { label: "Horario semanal", href: "/panel/horarios/semana" },
      { label: "Asignar curso", href: "/panel/horarios/asignar", manage: true },
    ],
  },
  {
    id: "asistencia",
    sprint: 6,
    label: "Control de Asistencia",
    icon: "asistencia",
    items: [
      { label: "Consultar asistencia", href: "/panel/asistencia", demo: "/demo/asistencia" },
      {
        label: "Pasar lista",
        href: "/panel/asistencia/registro",
        roles: ["DIRECTOR", "DOCENTE"],
      },
    ],
  },
  {
    id: "calificaciones",
    sprint: 7,
    label: "Gestión de Calificaciones",
    icon: "calificaciones",
    items: [
      { label: "Consultar calificaciones", href: "/panel/calificaciones", demo: "/demo/calificaciones" },
      {
        label: "Registrar notas",
        href: "/panel/calificaciones/registro",
        roles: ["DIRECTOR", "DOCENTE"],
      },
    ],
  },
  {
    id: "reportes",
    sprint: 8,
    label: "Reportes Académicos",
    icon: "reportes",
    items: [{ label: "Informes", href: "/panel/informes" }],
  },
  {
    id: "comunicados",
    label: "Comunicados",
    icon: "comunicados",
    items: [
      { label: "Tablón de avisos", href: "/panel/comunicados/bandeja" },
      { label: "Consultar comunicados", href: "/panel/comunicados", demo: "/demo/comunicados" },
    ],
  },
  {
    id: "cuenta",
    label: "Mi cuenta",
    icon: "cuenta",
    items: [{ label: "Cambiar contraseña", href: "/panel/cuenta/clave" }],
  },
];
export type ResolvedNavItem = { label: string; href: string; path: string };
export type ResolvedNavGroup = Omit<NavGroup, "items"> & {
  items: ResolvedNavItem[];
};
/** Filtra el menú según rol y modo (demo o sesión real) y resuelve las rutas. */
export function resolveNav(model: {
  demo: boolean;
  role: Role;
}): ResolvedNavGroup[] {
  const manager = model.role === "DIRECTOR" || model.role === "SECRETARIA";
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.flatMap((item): ResolvedNavItem[] => {
        if (item.manage && !manager) return [];
        if (item.roles && !item.roles.includes(model.role)) return [];
        if (model.demo && item.demo === undefined) return [];
        const path = model.demo ? item.demo! : item.href;
        return [
          {
            label: item.roleLabels?.[model.role] ?? item.label,
            path,
            href: model.demo ? `${path}?rol=${model.role}` : path,
          },
        ];
      }),
    }))
    .filter((group) => group.items.length > 0);
}
/** Elemento activo: la ruta más específica que coincide con la dirección actual. */
export function activeNav(groups: ResolvedNavGroup[], pathname: string) {
  let best: { group: ResolvedNavGroup; item: ResolvedNavItem } | null = null;
  for (const group of groups)
    for (const item of group.items) {
      const exact = pathname === item.path;
      const nested =
        item.path !== "/panel" &&
        item.path !== "/demo" &&
        pathname.startsWith(`${item.path}/`);
      if (
        (exact || nested) &&
        (!best || item.path.length > best.item.path.length)
      )
        best = { group, item };
    }
  return best;
}
