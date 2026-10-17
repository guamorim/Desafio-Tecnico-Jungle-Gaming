import {
  expect,
  type Page,
} from "@playwright/test";

export const checkoutWalletAddress = `0x${"7".repeat(40)}`;

export async function createPrimaryWallet(page: Page) {
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
