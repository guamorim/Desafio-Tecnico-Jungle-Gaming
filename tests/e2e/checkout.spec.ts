import {
  expect,
  test,
  type Page,
} from "@playwright/test";

import { addAuroraToCart } from "./helpers/cart.js";
import {
  loginWithAccount,
  loginWithFixture,
  logoutFromProfile,
  secondFixtureAccount,
} from "./helpers/auth.js";

const checkoutWalletAddress = `0x${"7".repeat(40)}`;

async function createCheckoutWallet(page: Page) {
  await page.goto("/wallets");

  const primaryWallet = page.locator(
    'section[aria-labelledby="primary-wallet-title"]',
  );

  await primaryWallet
    .getByLabel("Endereço da carteira")
    .fill(checkoutWalletAddress);
  await primaryWallet
    .getByRole("button", { name: "Adicionar principal" })
    .click();

  await expect(primaryWallet.getByRole("status")).toHaveText(
    "Carteira principal salva com sucesso.",
  );
}

async function prepareCheckout(
  page: Page,
  scenario:
    | "success"
    | "wallet-rejected"
    | "payment-refused"
    | "order-timeout" = "success",
) {
  await loginWithFixture(page);
  await createCheckoutWallet(page);
  await addAuroraToCart(page);
  await page.goto(`/checkout?scenario=${scenario}`);

  await expect(
    page.getByRole("heading", { name: "Carteira e rede" }),
  ).toBeVisible();
}

async function connectCheckoutWallet(page: Page) {
  await page
    .getByRole("button", { name: "Conectar carteira" })
    .click();

  await expect(
    page.getByRole("button", { name: "Desconectar carteira" }),
  ).toBeVisible();
}

async function confirmOrder(page: Page) {
  await page
    .getByRole("button", { name: "Confirmar compra" })
    .click();

  await expect(page).toHaveURL(/\/orders\/order-/);
}

test.describe("pagamento, carteira e pedidos", () => {
  test("protege pagamento e pedidos para visitantes", async ({
    page,
  }) => {
    await page.goto("/checkout");

    await expect(
      page.getByRole("heading", {
        name: "Entre para continuar o pagamento",
      }),
    ).toBeVisible();

    await page.goto("/orders/order-inexistente");

    await expect(
      page.getByRole("heading", {
        name: "Entre para consultar seu pedido",
      }),
    ).toBeVisible();
  });

  test("conecta a carteira, confirma e persiste o pedido", async ({
    page,
  }) => {
    await prepareCheckout(page);
    await connectCheckoutWallet(page);
    await confirmOrder(page);

    await expect(
      page.getByRole("heading", {
        name: "Seus NFTs agora estão na sua carteira",
      }),
    ).toBeVisible();
    await expect(page.getByText("Aurora Ape", { exact: true })).toBeVisible();
    await expect(page.getByText("ID da transação:")).toBeVisible();

    const orderUrl = page.url();
    await page.reload();

    await expect(page).toHaveURL(orderUrl);
    await expect(
      page.getByRole("heading", {
        name: "Seus NFTs agora estão na sua carteira",
      }),
    ).toBeVisible();

    await page.goto("/cart");
    await expect(
      page.getByRole("heading", { name: "Seu carrinho está vazio" }),
    ).toBeVisible();
  });

  test("trata recusa na conexão da carteira", async ({ page }) => {
    await prepareCheckout(page, "wallet-rejected");

    await page
      .getByRole("button", { name: "Conectar carteira" })
      .click();

    await expect(page.getByRole("alert")).toHaveText(
      "A conexão foi recusada na carteira simulada.",
    );
    await expect(
      page.getByRole("button", { name: "Confirmar compra" }),
    ).toBeDisabled();
  });

  test("desconecta a carteira e bloqueia a confirmação", async ({
    page,
  }) => {
    await prepareCheckout(page);
    await connectCheckoutWallet(page);

    await page
      .getByRole("button", { name: "Desconectar carteira" })
      .click();

    await expect(
      page.getByRole("button", { name: "Conectar carteira" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Confirmar compra" }),
    ).toBeDisabled();
  });

  test("mantém o carrinho quando o pagamento é recusado", async ({
    page,
  }) => {
    await prepareCheckout(page, "payment-refused");
    await connectCheckoutWallet(page);
    await confirmOrder(page);

    await expect(
      page.getByRole("heading", { name: "Pagamento recusado" }),
    ).toBeVisible();
    await expect(page.getByText("O pagamento foi recusado pela carteira simulada.")).toBeVisible();

    await page.goto("/cart");
    await expect(
      page.getByRole("listitem").filter({ hasText: "Aurora Ape" }),
    ).toBeVisible();
  });

  test("retoma a mesma tentativa após timeout sem duplicar o pedido", async ({
    page,
  }) => {
    test.setTimeout(35_000);
    await prepareCheckout(page, "order-timeout");
    await connectCheckoutWallet(page);

    const confirmButton = page.getByRole("button", {
      name: "Confirmar compra",
    });
    await confirmButton.click();

    await expect(page.getByRole("alert")).toContainText(
      "Não foi possível enviar o pedido",
      { timeout: 15_000 },
    );

    await confirmButton.click();
    await expect(page).toHaveURL(/\/orders\/order-/);
    await expect(
      page.getByRole("heading", {
        name: "Seus NFTs agora estão na sua carteira",
      }),
    ).toBeVisible();

    const rawOrders = await page.evaluate<string | null>(
      'localStorage.getItem("jungle-nft-marketplace:mock-orders:v1")',
    );
    const orderCount = rawOrders
      ? Object.keys(JSON.parse(rawOrders) as object).length
      : 0;

    expect(orderCount).toBe(1);
  });

  test("impede outra conta de consultar o pedido", async ({ page }) => {
    await prepareCheckout(page);
    await connectCheckoutWallet(page);
    await confirmOrder(page);

    await expect(
      page.getByRole("heading", {
        name: "Seus NFTs agora estão na sua carteira",
      }),
    ).toBeVisible();
    const orderUrl = page.url();

    await page.goto("/profile");
    await logoutFromProfile(page);
    await loginWithAccount(
      page,
      secondFixtureAccount.email,
      secondFixtureAccount.password,
    );
    await page.goto(orderUrl);

    await expect(
      page.getByRole("heading", { name: "Pedido não encontrado" }),
    ).toBeVisible();
  });
});
