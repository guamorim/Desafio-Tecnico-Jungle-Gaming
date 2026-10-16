import {
  expect,
  type Page,
} from "@playwright/test";

export async function addAuroraToCart(
  page: Page,
  quantity = 1,
) {
  await page.goto("/nfts/nft-aurora-ape");

  await expect(
    page.getByRole("heading", {
      name: "Aurora Ape",
      exact: true,
    }),
  ).toBeVisible();

  const purchasePanel = page.locator(
    'section[aria-labelledby="nft-edition-title"]',
  );

  await expect(
    purchasePanel.getByRole("radio", {
      name: "1/50",
      exact: true,
    }),
  ).toBeChecked();

  for (
    let currentQuantity = 1;
    currentQuantity < quantity;
    currentQuantity += 1
  ) {
    await purchasePanel
      .getByRole("button", {
        name: "Aumentar quantidade",
      })
      .click();
  }

  await purchasePanel
    .getByRole("button", {
      name: "Comprar NFT",
    })
    .click();

  await expect(
    purchasePanel.getByText(
      "Item adicionado ao carrinho.",
      { exact: true },
    ),
  ).toBeVisible();
}
