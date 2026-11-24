import { UserPage } from "@/components/user-page";
import { UserDirectory, parseSearch } from "@/components/user-directory";
export default async function Buscar({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  return (
    <UserPage title="Buscar usuarios" lead="Encuentra cuentas por nombre, CI o correo. Filtra por rol y estado.">
      {({ selfId }) => <UserDirectory mode="buscar" search={parseSearch(params, "buscar")} selfId={selfId} />}
    </UserPage>
  );
}
