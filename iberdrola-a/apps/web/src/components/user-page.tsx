import type { ReactNode } from "react";
import { PageTitle } from "@/components/page-title";
import { requireProfile } from "@/lib/auth";
import { loadPanel } from "@/lib/data/live";
import { PanelShell } from "@/components/panel-shell";
import { Card } from "@/components/ui/card";

/** Estructura común de Gestión de Usuarios: solo Dirección. */
export async function UserPage({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: (ctx: { selfId: string }) => ReactNode | Promise<ReactNode>;
}) {
  const { profile, user } = await requireProfile();
  const model = await loadPanel();
  return (
    <PanelShell model={model}>
      <div className="mb-7">
        <p className="mb-2 text-xs text-muted-foreground">
          Gestión de usuarios
        </p>
        <PageTitle fallback={title} />
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          {lead}
        </p>
      </div>
      {profile.rol !== "DIRECTOR" ? (
        <Card className="p-6 text-sm">
          Solo Dirección puede administrar usuarios.
        </Card>
      ) : (
        await children({ selfId: user.id })
      )}
    </PanelShell>
  );
}
