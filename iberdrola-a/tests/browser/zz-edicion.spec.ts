import { test, expect, type Page } from "@playwright/test";
// Se ejecuta al final (workers: 1, orden alfabético): usa las jornadas y
// calificaciones que registran las pruebas de asistencia y calificaciones.
async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill("director@example.invalid");
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("ContraseñaFicticia!");
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(page).toHaveURL(/\/panel$/);
}

test("edición: las planillas registradas se listan, filtran y reabren", async ({
  page,
}) => {
  await login(page);
  for (const [path, target] of [
    [
      "/panel/asistencia/editar",
      /\/panel\/asistencia\/registro\?curso=.+&fecha=\d{4}-\d{2}-\d{2}/,
    ],
    [
      "/panel/calificaciones/editar",
      /\/panel\/calificaciones\/registro\?asignacion=.+&trimestre=.+/,
    ],
  ] as const) {
    await page.goto(path);
    const edit = page.getByRole("link", { name: "Editar", exact: true });
    test.skip(
      (await edit.count()) === 0,
      "Ejecutar junto con las pruebas de asistencia y calificaciones.",
    );
    const status = page.getByRole("combobox", { name: "Filtrar por Estado" });
    if (await status.count()) {
      await status.selectOption({ index: 1 });
      await expect(edit.first()).toBeVisible();
      await page.getByRole("button", { name: "Limpiar filtros" }).click();
    }
    await edit.first().click();
    await expect(page).toHaveURL(target);
  }
});
