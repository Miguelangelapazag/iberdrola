import { UserPage } from "@/components/user-page";
import { CreateUserForm } from "@/components/user-forms";
import { Card } from "@/components/ui/card";
import { getAdminConfig, getAdminStatus } from "@/lib/env";
export default async function Nuevo() {
  return (
    <UserPage
      title="Crear usuario"
      lead="Registra a una persona y asígnale un rol. Recibirá un correo de invitación para crear su contraseña."
    >
      {() => (
        <Card className="max-w-3xl p-6">
          <CreateUserForm
            keyReady={!!getAdminConfig()}
            keyStatus={getAdminStatus()}
          />
        </Card>
      )}
    </UserPage>
  );
}
