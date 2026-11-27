"use client";
import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle, Save, UserCheck, UserX } from "lucide-react";
import { saveSubject, toggleSubject } from "@/app/panel/asignaturas/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ManagementState } from "@/lib/management-validation";

export type SubjectRow = {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  updated_at: string;
};

export function SubjectForm({ subject }: { subject?: SubjectRow }) {
  const [state, action, pending] = useActionState(
    saveSubject,
    {} as ManagementState,
  );
  const v = {
    nombre: state.values?.nombre ?? subject?.nombre ?? "",
    descripcion: state.values?.descripcion ?? subject?.descripcion ?? "",
    activo: state.values ? state.values.activo === "on" : (subject?.activo ?? true),
  };
  return (
    <form action={action} className="max-w-2xl space-y-5">
      {subject && (
        <>
          <input type="hidden" name="id" value={subject.id} />
          <input type="hidden" name="version" value={subject.updated_at} />
        </>
      )}
      <div>
        <label htmlFor="s-nombre" className="mb-2 block text-sm font-medium">
          Nombre *
        </label>
        <Input id="s-nombre" name="nombre" required maxLength={150} defaultValue={v.nombre} />
      </div>
      <div>
        <label htmlFor="s-descripcion" className="mb-2 block text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="s-descripcion"
          name="descripcion"
          rows={4}
          maxLength={1000}
          defaultValue={v.descripcion}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      {subject && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="activo" defaultChecked={v.activo} />
          Asignatura activa
        </label>
      )}
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <div className="flex gap-3">
        <Button disabled={pending}>
          {pending ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
          {subject ? "Guardar cambios" : "Registrar asignatura"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/panel/asignaturas">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}

export function SubjectToggle({ subject }: { subject: SubjectRow }) {
  const [state, action, pending] = useActionState(
    toggleSubject,
    {} as ManagementState,
  );
  const next = !subject.activo;
  return (
    <form action={action} className="inline-flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={subject.id} />
      <input type="hidden" name="version" value={subject.updated_at} />
      <input type="hidden" name="activo" value={String(next)} />
      <Button
        size="sm"
        variant={next ? "secondary" : "outline"}
        disabled={pending}
        className={next ? "" : "border-red-200 text-red-700 hover:bg-red-50"}
        onClick={(e) => {
          if (
            !next &&
            !window.confirm(
              `¿Desactivar «${subject.nombre}»? No podrá asignarse a nuevos cursos.`,
            )
          )
            e.preventDefault();
        }}
      >
        {pending ? (
          <LoaderCircle size={15} className="animate-spin" />
        ) : next ? (
          <UserCheck size={15} />
        ) : (
          <UserX size={15} />
        )}
        {next ? "Reactivar" : "Desactivar"}
      </Button>
      {state.error && (
        <span role="alert" className="max-w-[240px] text-right text-xs text-red-700">
          {state.error}
        </span>
      )}
    </form>
  );
}
