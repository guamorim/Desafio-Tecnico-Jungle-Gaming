import {
  expect,
  type Locator,
  type Page,
} from "@playwright/test";

export const fixtureAccount = {
  email: "ana@kurio.test",
  password: "Kurio#2026",
} as const;

export const secondFixtureAccount = {
  email: "leo@kurio.test",
  password: "Jungle#2026",
} as const;

export async function openLoginDialog(
  page: Page,
): Promise<Locator> {
  await page.goto("/profile");

  await expect(
    page.getByRole("heading", {
      name: "Entre para acessar seu perfil",
    }),
  ).toBeVisible();

  const accessRequiredSection = page
    .locator("section")
    .filter({
      has: page.getByRole("heading", {
        name: "Entre para acessar seu perfil",
      }),
    });

  await accessRequiredSection
    .getByRole("button", {
      name: "Entrar",
      exact: true,
    })
    .click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  return dialog;
}

export async function submitLogin(
  dialog: Locator,
  email: string,
  password: string,
) {
  await dialog.getByLabel("E-mail").fill(email);
  await dialog
    .getByLabel("Senha", { exact: true })
    .fill(password);

  await dialog
    .locator("form")
    .getByRole("button", {
      name: "Entrar",
      exact: true,
    })
    .click();
}

export async function loginWithFixture(
  page: Page,
) {
  await loginWithAccount(
    page,
    fixtureAccount.email,
    fixtureAccount.password,
  );
}

export async function loginWithAccount(
  page: Page,
  email: string,
  password: string,
) {
  const dialog = await openLoginDialog(page);

  await submitLogin(dialog, email, password);

  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("heading", {
      name: "Perfil do colecionador",
    }),
  ).toBeVisible();
}

export async function logoutFromProfile(page: Page) {
  await page
    .getByRole("button", {
      name: /^Sair(?: da conta)?$/,
    })
    .click();

  await expect(page).toHaveURL("/");
}
