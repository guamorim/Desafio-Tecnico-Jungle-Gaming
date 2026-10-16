import { expect, test } from "@playwright/test";

import {
  fixtureAccount,
  loginWithFixture,
  logoutFromProfile,
  openLoginDialog,
  submitLogin,
} from "./helpers/auth.js";

test.describe("autenticação", () => {
  test("bloqueia o perfil para visitantes", async ({
    page,
  }) => {
    await page.goto("/profile");

    await expect(
      page.getByRole("heading", {
        name: "Entre para acessar seu perfil",
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "Perfil do colecionador",
      }),
    ).toBeHidden();
  });

  test("rejeita credenciais incorretas", async ({
    page,
  }) => {
    const dialog = await openLoginDialog(page);

    await submitLogin(
      dialog,
      fixtureAccount.email,
      "Senha#Incorreta",
    );

    await expect(
      dialog.getByRole("alert"),
    ).toHaveText("E-mail ou senha incorretos.");
    await expect(dialog).toBeVisible();
  });

  test("realiza login e recupera a sessão após refresh", async ({
    page,
  }) => {
    await loginWithFixture(page);

    await page.reload();

    await expect(
      page.getByRole("heading", {
        name: "Perfil do colecionador",
      }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("main")
        .getByLabel("E-mail"),
    ).toHaveValue(fixtureAccount.email);
  });

  test("cria uma conta nova e mantém a sessão", async ({
    page,
  }) => {
    const dialog = await openLoginDialog(page);

    await dialog
      .getByRole("button", {
        name: "Criar conta",
        exact: true,
      })
      .click();

    await dialog
      .getByLabel("Nome de usuário")
      .fill("Beatriz Silva");
    await dialog
      .getByLabel("E-mail")
      .fill("beatriz.e2e@kurio.test");
    await dialog
      .getByLabel("Senha", { exact: true })
      .fill("NovaConta#2026");
    await dialog
      .getByLabel("Confirmar senha")
      .fill("NovaConta#2026");
    await dialog
      .locator("form")
      .getByRole("button", {
        name: "Criar perfil",
      })
      .click();

    await expect(dialog).toBeHidden();
    await expect(
      page.getByLabel("Nome de exibição"),
    ).toHaveValue("Beatriz Silva");

    await page.reload();

    await expect(
      page
        .getByRole("main")
        .getByLabel("E-mail"),
    ).toHaveValue("beatriz.e2e@kurio.test");
  });

  test("informa conflito de e-mail no cadastro", async ({
    page,
  }) => {
    const dialog = await openLoginDialog(page);

    await dialog
      .getByRole("button", {
        name: "Criar conta",
        exact: true,
      })
      .click();

    await dialog
      .getByLabel("Nome de usuário")
      .fill("Outra Ana");
    await dialog
      .getByLabel("E-mail")
      .fill(fixtureAccount.email);
    await dialog
      .getByLabel("Senha", { exact: true })
      .fill("OutraConta#2026");
    await dialog
      .getByLabel("Confirmar senha")
      .fill("OutraConta#2026");
    await dialog
      .locator("form")
      .getByRole("button", {
        name: "Criar perfil",
      })
      .click();

    await expect(
      dialog.getByText("Este e-mail já está em uso."),
    ).toBeVisible();
    await expect(dialog).toBeVisible();
  });

  test("encerra a sessão no logout", async ({ page }) => {
    await loginWithFixture(page);
    await logoutFromProfile(page);

    await page.goto("/profile");

    await expect(
      page.getByRole("heading", {
        name: "Entre para acessar seu perfil",
      }),
    ).toBeVisible();
  });
});
