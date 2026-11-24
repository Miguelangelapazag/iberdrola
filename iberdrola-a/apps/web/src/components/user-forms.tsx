"use client";
import { useActionState } from "react";
import { LoaderCircle, UserPlus, Save, UserX, UserCheck } from "lucide-react";
import { roles, roleLabels } from "@iberdrola/shared";
import {
  createUser,
  updateUser,
  setUserActive,
} from "@/app/panel/usuarios/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { UserFormState } from "@/lib/user-validation";
import type { UserRow } from "@/lib/data/users";

const selectClass =
  "h-12 w-full rounded-lg border border-input bg-background px-3 text-sm";

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  maxLength,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={`u-${name}`} className="mb-2 block text-sm font-medium">
        {label}
        {required ? " *" : ""}
      </label>
      <Input
        id={`u-${name}`}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        maxLength={maxLength}
        autoComplete="off"
      />
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Feedback({ state }: { state: UserFormState }) {
  return (
    <>
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {state.success}
        </p>
      )}
    </>
  );
}

function Fields({ v, emailHint }: { v: Partial<UserRow>; emailHint?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Nombres" name="nombres" defaultValue={v.nombres} required maxLength={120} />
      <Field label="Apellido paterno" name="apellido_paterno" defaultValue={v.apellido_paterno} maxLength={120} />
      <Field label="Apellido materno" name="apellido_materno" defaultValue={v.apellido_materno} maxLength={120} />
      <Field label="CI" name="ci" defaultValue={v.ci} maxLength={40} />
      <Field label="Correo electrónico" name="email" type="email" defaultValue={v.email} required maxLength={254} hint={emailHint} />
      <Field label="Teléfono" name="telefono" defaultValue={v.telefono} maxLength={40} />
      <div>
        <label htmlFor="u-rol" className="mb-2 block text-sm font-medium">
          Rol *
        </label>
        <select id="u-rol" name="rol" required defaultValue={v.rol ?? ""} className={selectClass}>
          <option value="">Selecciona un rol</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {roleLabels[r]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="u-direccion" className="mb-2 block text-sm font-medium">
          Dirección
        </label>
        <Input id="u-direccion" name="direccion" defaultValue={v.direccion} maxLength={500} />
      </div>
    </div>
  );
}

export function CreateUserForm({ keyReady }: { keyReady: boolean }) {
  const [state, action, pending] = useActionState(createUser, {} as UserFormState);
  const v = (state.values ?? {}) as Partial<UserRow>;
  return (
    <form
      key={state.success ? `ok-${state.attempt}` : "form"}
      action={action}
      className="space-y-5"
    >
      <Fields
        v={state.success ? {} : v}
        emailHint="Recibirá una invitación para crear su propia contraseña."
      />
      <Feedback state={state} />
      {!keyReady && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Falta configurar <code>SUPABASE_SERVICE_ROLE_KEY</code> en el servidor
          para poder crear usuarios.
        </p>
      )}
      <Button disabled={pending || !keyReady}>
        {pending ? <LoaderCircle size={16} className="animate-spin" /> : <UserPlus size={16} />}
        Crear usuario
      </Button>
    </form>
  );
}

export function EditUserForm({ user, emailsAvailable }: { user: UserRow; emailsAvailable: boolean }) {
  const [state, action, pending] = useActionState(updateUser, {} as UserFormState);
  const v = state.values ? ({ ...user, ...state.values } as UserRow) : user;
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={user.id} />
      <input type="hidden" name="version" value={user.version} />
      <Fields
        v={v}
        emailHint={
          emailsAvailable
            ? "Si cambias el correo, el usuario deberá entrar con el nuevo."
            : "Sin clave de servicio el correo no se puede consultar ni cambiar."
        }
      />
      <Feedback state={state} />
      <Button disabled={pending}>
        {pending ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
        Guardar cambios
      </Button>
    </form>
  );
}

export function ActiveToggle({
  user,
  self,
  compact = false,
}: {
  user: UserRow;
  self: boolean;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState(setUserActive, {} as UserFormState);
  const next = !user.activo;
  return (
    <form action={action} className="inline-flex flex-col items-start gap-1">
      <input type="hidden" name="id" value={user.id} />
      <input type="hidden" name="activo" value={String(next)} />
      <Button
        size={compact ? "sm" : "default"}
        variant={next ? "secondary" : "outline"}
        disabled={pending || (self && !next)}
        className={next ? "" : "border-red-200 text-red-700 hover:bg-red-50"}
        title={self && !next ? "No puedes desactivar tu propia cuenta" : undefined}
        onClick={(e) => {
          if (
            !next &&
            !window.confirm(
              `¿Desactivar a ${user.fullName}? No podrá iniciar sesión hasta que lo reactives.`,
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
        <span role="alert" className="max-w-[220px] text-xs text-red-700">
          {state.error}
        </span>
      )}
    </form>
  );
}
