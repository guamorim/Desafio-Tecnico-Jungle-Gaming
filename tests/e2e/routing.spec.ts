import { expect, test } from "@playwright/test";

test.describe("roteamento", () => {
  test("apresenta a página 404 global e permite voltar ao mercado", async ({
    page,
  }) => {
    await page.goto("/rota-inexistente");

    await expect(
      page.getByText("Erro 404", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Página não encontrada",
      }),
    ).toBeVisible();

    await page
      .getByRole("link", { name: "Voltar ao mercado" })
      .click();

    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", {
        name: "Descubra NFTs extraordinários",
      }),
    ).toBeVisible();
  });
});
