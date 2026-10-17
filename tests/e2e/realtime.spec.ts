import { expect, test } from "@playwright/test";

import { loginWithFixture } from "./helpers/auth.js";
import { addAuroraToCart } from "./helpers/cart.js";
import {
  interruptRealtime,
  updateAuroraInRealtime,
  waitForRealtime,
} from "./helpers/realtime.js";
import { createPrimaryWallet } from "./helpers/wallet.js";

async function prepareCheckout(page: Parameters<typeof loginWithFixture>[0]) {
  await loginWithFixture(page);
  await createPrimaryWallet(page);
  await addAuroraToCart(page);
  await page.goto("/checkout");
  await page
    .getByRole("button", { name: "Conectar carteira" })
    .click();
  await expect(
    page.getByRole("button", { name: "Desconectar carteira" }),
  ).toBeVisible();
  await waitForRealtime(page);
}

test.describe("tempo real e reconciliação REST", () => {
  test("atualiza o catálogo e ignora eventos duplicados ou antigos", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForRealtime(page);

    const auroraCard = page
      .getByRole("article")
      .filter({ hasText: "Aurora Ape" })
      .first();

    await expect(auroraCard).toContainText("0.125 ETH");

    await updateAuroraInRealtime(page, {
      priceEth: "0.080",
      includeDuplicateAndStale: true,
    });

    await expect(auroraCard).toContainText("0.080 ETH");
    await expect(auroraCard).not.toContainText("999 ETH");

    await page.reload();
    await expect(
      page
        .getByRole("article")
        .filter({ hasText: "Aurora Ape" })
        .first(),
    ).toContainText("0.080 ETH");
  });

  test("atualiza a disponibilidade na tela de detalhes", async ({
    page,
  }) => {
    await page.goto("/nfts/nft-aurora-ape");
    await waitForRealtime(page);

    const purchasePanel = page.locator(
      'section[aria-labelledby="nft-edition-title"]',
    );
    const editionRadio = purchasePanel.getByRole("radio", {
      name: "1/50",
      exact: true,
    });

    if (!(await editionRadio.isChecked())) {
      await editionRadio.locator("..").click();
    }
    await expect(editionRadio).toBeChecked();

    await updateAuroraInRealtime(page, {
      availableQuantity: 0,
    });

    await expect(
      purchasePanel.getByText("Edição indisponível"),
    ).toBeVisible();
    await expect(
      purchasePanel.getByRole("button", { name: "Comprar NFT" }),
    ).toBeHidden();
  });

  test("recalcula o carrinho e persiste a cotação reconciliada", async ({
    page,
  }) => {
    await addAuroraToCart(page);
    await page.goto("/cart");
    await waitForRealtime(page);

    await updateAuroraInRealtime(page, {
      priceEth: "0.080",
      includeDuplicateAndStale: true,
    });

    await expect(
      page.getByRole("status").filter({
        hasText: "atualizados em tempo real",
      }),
    ).toBeVisible();
    const summary = page.getByRole("complementary", {
      name: "Resumo da carteira",
    });
    await expect(summary.getByText("0.08 ETH", { exact: true })).toBeVisible();
    await expect(summary.getByText("0.096 ETH", { exact: true })).toBeVisible();
    await expect(page.getByText("999 ETH", { exact: true })).toHaveCount(0);

    await page.reload();
    await expect(summary.getByText("0.08 ETH", { exact: true })).toBeVisible();
    await expect(summary.getByText("0.096 ETH", { exact: true })).toBeVisible();
  });

  test("permite remover do carrinho uma edição que esgotou", async ({
    page,
  }) => {
    await addAuroraToCart(page, 2);
    await page.goto("/cart");
    await waitForRealtime(page);

    await updateAuroraInRealtime(page, {
      availableQuantity: 0,
    });

    const cartItem = page
      .getByRole("listitem")
      .filter({ hasText: "Aurora Ape" });
    await expect(cartItem.getByText("Edição esgotada")).toBeVisible();

    await cartItem
      .getByRole("button", { name: "Remover item" })
      .click();

    await expect(
      page.getByRole("heading", { name: "Seu carrinho está vazio" }),
    ).toBeVisible();
  });

  test("exige revisão explícita quando a cotação muda no checkout", async ({
    page,
  }) => {
    await prepareCheckout(page);

    const confirmButton = page.getByRole("button", {
      name: "Confirmar compra",
    });
    await expect(confirmButton).toBeEnabled();

    await updateAuroraInRealtime(page, { priceEth: "0.080" });

    const quoteAlert = page.getByRole("alert").filter({
      hasText: "A cotação mudou",
    });
    await expect(quoteAlert).toBeVisible();
    await expect(confirmButton).toBeDisabled();
    await expect(page.getByText("0.096 ETH", { exact: true })).toBeVisible();

    await quoteAlert
      .getByRole("button", { name: "Revisar novos valores" })
      .click();

    await expect(quoteAlert).toBeHidden();
    await expect(confirmButton).toBeEnabled();
  });

  test("mantém pedido pendente e o recupera pela API após queda do socket", async ({
    page,
  }) => {
    await prepareCheckout(page);

    await page
      .getByRole("button", { name: "Confirmar compra" })
      .click();
    await expect(page).toHaveURL(/\/orders\/order-/);
    await expect(
      page.getByRole("heading", { name: "Processando seu pedido" }),
    ).toBeVisible();

    await interruptRealtime(page);

    await expect(
      page.getByTestId("realtime-connection-status"),
    ).toHaveText("Tempo real desconectado");
    await expect(
      page.getByText("O pedido continua sendo consultado pela API"),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "Seus NFTs agora estão na sua carteira",
      }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByTestId("realtime-connection-status"),
    ).toHaveText("Tempo real conectado", { timeout: 10_000 });
  });
});
