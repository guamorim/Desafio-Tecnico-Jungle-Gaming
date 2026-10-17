import {
  expect,
  test,
  type Page,
} from "@playwright/test";

import {
  expireCurrentSession,
  fixtureAccount,
  loginWithAccount,
  loginWithFixture,
  logoutFromProfile,
  secondFixtureAccount,
} from "./helpers/auth.js";
import { addAuroraToCart } from "./helpers/cart.js";

async function expectAuroraQuantity(
  page: Page,
  quantity: number,
) {
  await page.goto("/cart");

  const cartItem = page
    .getByRole("listitem")
    .filter({ hasText: "Aurora Ape" });

  await expect(cartItem).toBeVisible();
  await expect(
    cartItem
      .locator(`[aria-label="Quantidade: ${quantity}"]`)
      .filter({ visible: true }),
  ).toBeVisible();
}

async function logout(page: Page) {
  await page.goto("/profile");
  await logoutFromProfile(page);
}

test.describe("isolamento do carrinho", () => {
  test.describe.configure({ timeout: 45_000 });

  test("mantém separados os carrinhos do visitante e da conta", async ({
    page,
  }) => {
    await addAuroraToCart(page);

    await loginWithFixture(page);
    await expectAuroraQuantity(page, 1);

    await addAuroraToCart(page);
    await expectAuroraQuantity(page, 2);

    await logout(page);
    await page.goto("/cart");
    await expect(
      page.getByRole("heading", {
        name: "Seu carrinho está vazio",
      }),
    ).toBeVisible();

    await loginWithFixture(page);
    await expectAuroraQuantity(page, 2);
  });

  test("isola o carrinho durante a troca de contas", async ({
    page,
  }) => {
    await loginWithFixture(page);
    await addAuroraToCart(page);
    await logout(page);

    await loginWithAccount(
      page,
      secondFixtureAccount.email,
      secondFixtureAccount.password,
    );
    await page.goto("/cart");

    await expect(
      page.getByRole("heading", {
        name: "Seu carrinho está vazio",
      }),
    ).toBeVisible();

    await addAuroraToCart(page, 2);
    await expectAuroraQuantity(page, 2);
    await logout(page);

    await loginWithAccount(
      page,
      fixtureAccount.email,
      fixtureAccount.password,
    );
    await expectAuroraQuantity(page, 1);
  });

  test("retoma o carrinho da conta após a sessão expirar", async ({
    page,
  }) => {
    await loginWithFixture(page);
    await addAuroraToCart(page, 2);

    await expireCurrentSession(page);

    await page.goto("/profile");
    await page.reload();

    await expect(
      page.getByRole("heading", {
        name: "Entre para acessar seu perfil",
      }),
    ).toBeVisible();

    await page.goto("/cart");
    await expect(
      page.getByRole("heading", {
        name: "Seu carrinho está vazio",
      }),
    ).toBeVisible();

    await loginWithFixture(page);
    await expectAuroraQuantity(page, 2);
  });
});
