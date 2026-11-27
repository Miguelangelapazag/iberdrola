import Link from "next/link";
import { UserPage } from "@/components/user-page";
import { UserDirectory, parseSearch } from "@/components/user-directory";
import { Button } from "@/components/ui/button";
export default async function Familias({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <UserPage
      title="Accesos de familias"
      lead="Cuentas de padres, madres y tutores. Cada cuenta ve solo a los estudiantes vinculados a su ficha de tutor con consulta autorizada."
    >
      {({ selfId }) => (
        <>
          <div className="mb-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/panel/usuarios/nuevo">Crear acceso familiar</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/panel/gestion/tutores">Fichas de tutores</Link>
            </Button>
          </div>
          <UserDirectory
            mode="buscar"
            search={parseSearch(params, "buscar")}
            selfId={selfId}
            fixedRole="PADRE"
            path="/panel/usuarios/familias"
          />
        </>
      )}
    </UserPage>
  );
}
