import { expect, test } from "@playwright/test";

import { addAuroraToCart } from "./helpers/cart.js";

test.describe("carrinho", () => {
  test("apresenta o estado vazio", async ({ page }) => {
    await page.goto("/cart");

    await expect(
      page.getByRole("heading", {
        name: "Seu carrinho está vazio",
      }),
    ).toBeVisible();
  });

  test("adiciona, atualiza e persiste um item", async ({
    page,
  }) => {
    await addAuroraToCart(page);
    await page.goto("/cart");

    const cartItem = page
      .getByRole("listitem")
      .filter({ hasText: "Aurora Ape" });

    await expect(cartItem).toBeVisible();
    await expect(
      cartItem
        .locator('[aria-label="Quantidade: 1"]')
        .filter({ visible: true }),
    ).toBeVisible();

    await cartItem
      .getByRole("button", {
        name: "Aumentar quantidade",
      })
      .click();

    await expect(
      cartItem
        .locator('[aria-label="Quantidade: 2"]')
        .filter({ visible: true }),
    ).toBeVisible();

    const summary = page.getByRole("complementary", {
      name: "Resumo da carteira",
    });

    await expect(
      summary.getByText("0.25 ETH", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      summary.getByText("0.266 ETH", {
        exact: true,
      }),
    ).toBeVisible();

    await page.reload();

    await expect(
      page
        .getByRole("listitem")
        .filter({ hasText: "Aurora Ape" })
        .locator('[aria-label="Quantidade: 2"]')
        .filter({ visible: true }),
    ).toBeVisible();
  });

  test("aplica e remove um cupom válido", async ({
    page,
  }) => {
    await addAuroraToCart(page, 2);
    await page.goto("/cart");

    const summary = page.getByRole("complementary", {
      name: "Resumo da carteira",
    });
    const couponInput = summary.getByLabel(
      "Código promocional",
    );

    await couponInput.fill("JUNGLE10");
    await summary
      .getByRole("button", { name: "Aplicar" })
      .click();

    await expect(
      summary.getByRole("status"),
    ).toContainText("Cupom JUNGLE10 aplicado");
    await expect(
      summary.getByText("(-) 0.025 ETH", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      summary.getByText("0.241 ETH", {
        exact: true,
      }),
    ).toBeVisible();

    await summary
      .getByRole("button", { name: "Remover" })
      .click();

    await expect(couponInput).toHaveValue("");
    await expect(summary.getByRole("status")).toBeHidden();
    await expect(
      summary.getByText("0.266 ETH", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("trata cupons inválido e expirado", async ({
    page,
  }) => {
    await addAuroraToCart(page);
    await page.goto("/cart");

    const summary = page.getByRole("complementary", {
      name: "Resumo da carteira",
    });
    const couponInput = summary.getByLabel(
      "Código promocional",
    );

    await couponInput.fill("NAOEXISTE");
    await summary
      .getByRole("button", { name: "Aplicar" })
      .click();

    await expect(
      page.getByRole("alert"),
    ).toHaveText("Código promocional inválido.");

    await couponInput.fill("GENESIS20");
    await summary
      .getByRole("button", { name: "Aplicar" })
      .click();

    await expect(
      page.getByRole("alert"),
    ).toHaveText("Este código promocional expirou.");
  });

  test("remove o último item do carrinho", async ({
    page,
  }) => {
    await addAuroraToCart(page);
    await page.goto("/cart");

    const cartItem = page
      .getByRole("listitem")
      .filter({ hasText: "Aurora Ape" });

    await cartItem
      .getByRole("button", {
        name: "Remover item",
        exact: true,
      })
      .click();

    await expect(
      page.getByRole("heading", {
        name: "Seu carrinho está vazio",
      }),
    ).toBeVisible();
  });
});
