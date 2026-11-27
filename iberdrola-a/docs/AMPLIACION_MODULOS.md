# Ampliación de módulos (filtros y módulos de IberAcadX)

## Qué se agregó

| Módulo | Dónde | Notas |
| --- | --- | --- |
| Filtros en consultas | Estudiantes, Cursos, Horarios, Asistencia, Calificaciones | Desplegables por columna además del buscador |
| Filtros en gestión | Fichas, Cursos, Matrículas, Asignaciones, Asignaturas | Gestión, curso, docente, materia, año y estado |
| Asignaturas | Administrar Asignaturas → Asignaturas | Catálogo de materias: registrar, editar, activar/inactivar |
| Personal administrativo | Gestión de Usuarios | Cuentas de Secretaría (solo Dirección) |
| Accesos de familias | Gestión de Usuarios | Cuentas de padres y tutores |
| Vincular cuenta a ficha existente | Crear usuario | Usa la misma invitación con enlace de verificación por correo |
| Eliminar borradores | Control de Asistencia / Gestión de Calificaciones | Solo registros en BORRADOR de tus cursos y materias |
| Informes guardados | Reportes Académicos → Informes | Guarda los filtros (no los datos); abrir, renombrar, actualizar y eliminar |

## Paso obligatorio en Supabase (una sola vez)

En Supabase → **SQL Editor**, pega y ejecuta el contenido de
`supabase/migrations/202611270001_ampliacion_modulos.sql`.

- Crea la tabla `reportes_guardados` y la función `eliminar_registro_academico`.
- Se puede ejecutar más de una vez sin borrar datos.
- No toca comunicados ni ninguna otra tabla existente.
- Es compatible con una base que ya tenga la actualización 0.10 de IberAcadX.

Sin este paso todo lo demás funciona; solo «Informes guardados» y «Eliminar borradores» muestran un aviso pidiendo ejecutar el archivo.

## Pruebas

- `npm run test:db`: 156 pruebas de base (incluye `supabase/tests/ampliacion.mjs`).
- `npm run test:web`: 37 pruebas unitarias.
- `npm run test:e2e`: 42 pruebas de navegador con datos ficticios.
