import { expect, test } from "@playwright/test";

import {
  fixtureAccount,
  loginWithFixture,
  logoutFromProfile,
  openLoginDialog,
  submitLogin,
} from "./helpers/auth.js";

test.describe("perfil do colecionador", () => {
  test.beforeEach(async ({ page }) => {
    await loginWithFixture(page);
  });

  test("atualiza e persiste os dados do perfil", async ({
    page,
  }) => {
    await page
      .getByLabel("Nome de exibição")
      .fill("Ana Sato Atualizada");
    await page
      .getByLabel("Nome de usuário")
      .fill("ana-atualizada");
    await page
      .getByLabel("Nome ENS")
      .fill("ana-atualizada.eth");
    await page
      .getByLabel("Apelido da carteira")
      .fill("Carteira Jungle");

    await page
      .getByRole("button", {
        name: "Salvar alterações",
      })
      .click();

    await expect(
      page.getByRole("status"),
    ).toHaveText("Perfil atualizado com sucesso.");

    await page.reload();

    await expect(
      page.getByLabel("Nome de exibição"),
    ).toHaveValue("Ana Sato Atualizada");
    await expect(
      page.getByLabel("Nome de usuário"),
    ).toHaveValue("ana-atualizada");
    await expect(
      page.getByLabel("Nome ENS"),
    ).toHaveValue("ana-atualizada.eth");
    await expect(
      page.getByLabel("Apelido da carteira"),
    ).toHaveValue("Carteira Jungle");
  });

  test("apresenta erro quando a senha atual está incorreta", async ({
    page,
  }) => {
    await page
      .getByLabel("Senha atual")
      .fill("Senha#Incorreta");
    await page
      .getByLabel("Nova senha", { exact: true })
      .fill("Kurio#Nova2026");
    await page
      .getByLabel("Confirmar nova senha")
      .fill("Kurio#Nova2026");

    await page
      .getByRole("button", {
        name: "Salvar alterações",
      })
      .click();

    await expect(
      page.getByText("A senha atual está incorreta."),
    ).toBeVisible();
  });

  test("altera a senha e utiliza a nova credencial", async ({
    page,
  }) => {
    const newPassword = "Kurio#Nova2026";

    await page
      .getByLabel("Senha atual")
      .fill(fixtureAccount.password);
    await page
      .getByLabel("Nova senha", { exact: true })
      .fill(newPassword);
    await page
      .getByLabel("Confirmar nova senha")
      .fill(newPassword);

    await page
      .getByRole("button", {
        name: "Salvar alterações",
      })
      .click();

    await expect(
      page.getByRole("status"),
    ).toHaveText("Perfil atualizado com sucesso.");

    await logoutFromProfile(page);

    const dialog = await openLoginDialog(page);
    await submitLogin(
      dialog,
      fixtureAccount.email,
      newPassword,
    );

    await expect(dialog).toBeHidden();
    await expect(
      page.getByRole("heading", {
        name: "Perfil do colecionador",
      }),
    ).toBeVisible();
  });
});
