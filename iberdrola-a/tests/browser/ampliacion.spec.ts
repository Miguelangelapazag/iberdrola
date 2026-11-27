import { test, expect, type Page } from "@playwright/test";
async function login(page: Page, email = "director@example.invalid") {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(email);
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("ContraseñaFicticia!");
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(page).toHaveURL(/\/panel$/);
}

test("ampliación: nuevas ventanas y filtros para Dirección", async ({
  page,
}) => {
  await login(page);
  for (const [path, title] of [
    ["/panel/gestion/asignaturas", "Asignaturas."],
    ["/panel/usuarios/personal", "Personal administrativo."],
    ["/panel/usuarios/familias", "Accesos de familias."],
    ["/panel/asistencia/borradores", "Eliminar borradores."],
    ["/panel/calificaciones/borradores", "Eliminar borradores."],
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  }
  await page.goto("/panel/gestion/asignaciones");
  for (const label of ["Gestión", "Curso", "Docente", "Materia", "Estado"])
    await expect(
      page.getByRole("combobox", { name: `Filtrar por ${label}` }),
    ).toBeVisible();
  await page.goto("/panel/gestion/matriculas?estado=RETIRADA");
  await expect(
    page.getByRole("combobox", { name: "Filtrar por Estado" }),
  ).toHaveValue("RETIRADA");
  await expect(
    page.getByRole("link", { name: "Limpiar filtros" }),
  ).toBeVisible();
  await page.goto("/panel/usuarios/nuevo");
  await page.getByLabel("Vincular a una ficha existente").check();
  await expect(page.getByLabel("Ficha registrada sin cuenta *")).toBeVisible();
  await expect(page.getByLabel("Nombres *")).toHaveCount(0);
});

test("ampliación: Secretaría no ve las cuentas de personal", async ({
  page,
}) => {
  await login(page, "secretaria@example.invalid");
  await page.goto("/panel/usuarios/personal");
  await expect(
    page.getByText("Solo Dirección puede administrar usuarios."),
  ).toBeVisible();
});
