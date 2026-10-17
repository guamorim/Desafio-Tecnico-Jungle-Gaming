import {
  expect,
  test,
  type Page,
} from "@playwright/test";

import { loginWithFixture } from "./helpers/auth.js";

const tabletWalletAddress = `0x${"8".repeat(40)}`;

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate<{
    clientWidth: number;
    scrollWidth: number;
  }>(`(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth
    )
  }))()`);

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(
    dimensions.clientWidth + 1,
  );
}

test.describe("responsividade em tablet", () => {
  test("mantém catálogo, detalhe, carrinho e checkout utilizáveis em 768 px", async ({
    page,
  }) => {
    await loginWithFixture(page);
    await page.goto("/wallets");

    const primaryWallet = page.locator(
      'section[aria-labelledby="primary-wallet-title"]',
    );

    await primaryWallet
      .getByLabel("Endereço da carteira")
      .fill(tabletWalletAddress);
    await primaryWallet
      .getByRole("button", { name: "Adicionar carteira principal" })
      .click();
    await expect(primaryWallet.getByRole("status")).toHaveText(
      "Carteira principal salva com sucesso.",
    );

    await page.goto("/");
    await expect(
      page.getByRole("navigation", {
        name: "Navegação principal",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Abrir filtros" }),
    ).toBeHidden();
    await expect(
      page.getByRole("complementary", {
        name: "Filtros e NFT em destaque",
      }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page
      .getByRole("tabpanel")
      .locator('a[href="/nfts/nft-aurora-ape"]')
      .first()
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Aurora Ape",
        exact: true,
      }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const purchasePanel = page.locator(
      'section[aria-labelledby="nft-edition-title"]',
    );
    await purchasePanel
      .getByRole("button", { name: "Comprar NFT" })
      .click();
    await expect(
      purchasePanel.getByText("Item adicionado ao carrinho."),
    ).toBeVisible();

    await page
      .getByRole("link", { name: /Abrir carrinho/ })
      .filter({ visible: true })
      .click();
    await expect(
      page.getByRole("listitem").filter({ hasText: "Aurora Ape" }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page
      .getByRole("link", { name: "Conectar e finalizar" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Carteira e rede" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Conectar carteira" }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
