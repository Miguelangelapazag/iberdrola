"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import {
  canManage,
  uuidPattern,
  type ManagementState,
} from "@/lib/management-validation";

const field = (form: FormData, name: string) =>
  typeof form.get(name) === "string" ? String(form.get(name)).trim() : "";

/** Crea o actualiza una asignatura del catálogo institucional. */
export async function saveSubject(
  previous: ManagementState,
  form: FormData,
): Promise<ManagementState> {
  const { supabase, profile } = await requireProfile();
  const values = {
    id: field(form, "id"),
    version: field(form, "version"),
    nombre: field(form, "nombre"),
    descripcion: field(form, "descripcion"),
    activo: form.get("activo") === "on" ? "on" : "",
  };
  const fail = (error: string): ManagementState => ({
    error,
    values,
    attempt: (previous.attempt || 0) + 1,
  });
  if (!canManage(profile.rol))
    return fail("Solo Dirección y Secretaría pueden gestionar asignaturas.");
  if (!values.nombre || values.nombre.length > 150)
    return fail("Escribe un nombre de hasta 150 caracteres.");
  if (values.descripcion.length > 1000)
    return fail("La descripción admite hasta 1000 caracteres.");
  if (values.id && !uuidPattern.test(values.id))
    return fail("La asignatura seleccionada no es válida.");
  if (values.id && (!values.version || Number.isNaN(Date.parse(values.version))))
    return fail("Recarga la asignatura antes de editarla.");
  let failure: string | null = null;
  try {
    const result = values.id
      ? await supabase
          .from("asignaturas")
          .update({
            nombre: values.nombre,
            descripcion: values.descripcion || null,
            activo: values.activo === "on",
          })
          .eq("id", values.id)
          .eq("updated_at", values.version)
          .select("id")
      : await supabase
          .from("asignaturas")
          .insert({
            nombre: values.nombre,
            descripcion: values.descripcion || null,
          })
          .select("id");
    if (result.error)
      failure =
        result.error.code === "23505"
          ? "Ya existe una asignatura con ese nombre."
          : result.error.code === "42501"
            ? "Tu cuenta no tiene permiso para guardar asignaturas."
            : "No se pudo guardar. Revisa los datos e inténtalo de nuevo.";
    else if (!result.data?.length)
      failure = "El registro cambió o no está disponible. Recarga la página.";
  } catch {
    failure = "No se pudo guardar. Comprueba la conexión e inténtalo de nuevo.";
  }
  if (failure) return fail(failure);
  revalidatePath("/panel", "layout");
  redirect("/panel/asignaturas?guardado=1");
}

/** Activa o desactiva una asignatura sin tocar sus demás datos. */
export async function toggleSubject(
  _previous: ManagementState,
  form: FormData,
): Promise<ManagementState> {
  const { supabase, profile } = await requireProfile();
  const id = field(form, "id");
  const version = field(form, "version");
  if (!canManage(profile.rol))
    return { error: "Solo Dirección y Secretaría pueden gestionar asignaturas." };
  if (!uuidPattern.test(id) || Number.isNaN(Date.parse(version)))
    return { error: "La asignatura seleccionada no es válida." };
  const next = form.get("activo") === "true";
  try {
    const result = await supabase
      .from("asignaturas")
      .update({ activo: next })
      .eq("id", id)
      .eq("updated_at", version)
      .select("id");
    if (result.error)
      return { error: "No se pudo guardar. Inténtalo de nuevo." };
    if (!result.data?.length)
      return { error: "El registro cambió. Recarga la página." };
  } catch {
    return { error: "No se pudo guardar. Comprueba la conexión." };
  }
  revalidatePath("/panel", "layout");
  return { success: next ? "Asignatura reactivada." : "Asignatura desactivada." };
}
