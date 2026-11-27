"use client";
import { useActionState } from "react";
import { LoaderCircle, UserCheck, UserX } from "lucide-react";
import { toggleRecordActive } from "@/app/panel/gestion/actions";
import { Button } from "@/components/ui/button";
import type {
  ManagementSection,
  ManagementState,
} from "@/lib/management-validation";

/** Activa o desactiva una ficha desde la lista, igual que en usuarios. */
export function RecordToggle({
  section,
  id,
  active,
  name,
}: {
  section: ManagementSection;
  id: string;
  active: boolean;
  name: string;
}) {
  const [state, action, pending] = useActionState(
    toggleRecordActive,
    {} as ManagementState,
  );
  const next = !active;
  return (
    <form action={action} className="inline-flex flex-col items-end gap-1">
      <input type="hidden" name="section" value={section} />
      <input type="hidden" name="id" value={id} />
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
              `¿Desactivar «${name}»? Se conserva su historial y podrás reactivarla cuando quieras.`,
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
