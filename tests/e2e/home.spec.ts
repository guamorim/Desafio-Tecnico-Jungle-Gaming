import { expect, test } from "@playwright/test";

test("carrega a homepage e o catálogo", async ({
  page,
}, testInfo) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Descubra NFTs extraordinários",
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", {
      name: "Aurora Ape",
      exact: true,
    }).first(),
  ).toBeVisible();

  const mobileNavigation = page.getByRole("navigation", {
    name: "Navegação principal em dispositivos móveis",
  });

  if (testInfo.project.name === "mobile-chromium") {
    await expect(mobileNavigation).toBeVisible();
    await expect(
      mobileNavigation.getByRole("link", {
        name: /Carrinho/,
      }),
    ).toBeVisible();
  } else {
    await expect(mobileNavigation).toBeHidden();
  }
});
