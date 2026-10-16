import {
  expect,
  test,
  type Page,
} from "@playwright/test";

import {
  fixtureAccount,
  loginWithAccount,
  loginWithFixture,
  logoutFromProfile,
  secondFixtureAccount,
} from "./helpers/auth.js";

function getDetailFavoriteButton(page: Page) {
  return page
    .getByRole("button", {
      name: /favoritos$/i,
    })
    .filter({ visible: true });
}

async function favoriteAurora(page: Page) {
  await page.goto("/nfts/nft-aurora-ape");

  const favoriteButton = getDetailFavoriteButton(page);

  await expect(favoriteButton).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await favoriteButton.click();
  await expect(favoriteButton).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(favoriteButton).toBeEnabled();
}

test.describe("favoritos", () => {
  test("solicita autenticação ao visitante", async ({
    page,
  }) => {
    await page.goto("/nfts/nft-aurora-ape");
    await getDetailFavoriteButton(page).click();

    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("adiciona, persiste e remove um favorito", async ({
    page,
  }) => {
    await loginWithFixture(page);
    await favoriteAurora(page);

    await page.reload();
    await expect(
      page
        .getByRole("button", {
          name: /Remover .*favoritos/,
        })
        .filter({ visible: true }),
    ).toHaveAttribute("aria-pressed", "true");

    await page.goto("/favorites");
    await expect(
      page.getByRole("heading", {
        name: "Aurora Ape",
        exact: true,
      }),
    ).toBeVisible();

    await page
      .getByRole("button", {
        name: "Remover Aurora Ape dos favoritos",
      })
      .click();

    await expect(
      page.getByRole("heading", {
        name: "Sua lista está vazia",
      }),
    ).toBeVisible();
  });

  test("isola a lista durante a troca de contas", async ({
    page,
  }) => {
    await loginWithFixture(page);
    await favoriteAurora(page);

    await page.goto("/profile");
    await logoutFromProfile(page);

    await loginWithAccount(
      page,
      secondFixtureAccount.email,
      secondFixtureAccount.password,
    );
    await page.goto("/favorites");

    await expect(
      page.getByRole("heading", {
        name: "Sua lista está vazia",
      }),
    ).toBeVisible();

    await page.goto("/profile");
    await logoutFromProfile(page);

    await loginWithAccount(
      page,
      fixtureAccount.email,
      fixtureAccount.password,
    );
    await page.goto("/favorites");

    await expect(
      page.getByRole("heading", {
        name: "Aurora Ape",
        exact: true,
      }),
    ).toBeVisible();
  });

  test("desfaz a atualização otimista quando a API falha", async ({
    page,
  }) => {
    await loginWithFixture(page);
    await page.goto("/nfts/nft-aurora-ape");
    await page.evaluate(() => {
      localStorage.setItem(
        "jungle-nft-marketplace:mock-favorite-error",
        "true",
      );
    });

    const favoriteButton = getDetailFavoriteButton(page);

    await favoriteButton.click();
    await expect(favoriteButton).toHaveAttribute(
      "aria-pressed",
      "true",
      { timeout: 250 },
    );
    await expect(
      page.getByRole("alert"),
    ).toContainText(
      "Falha simulada ao atualizar o favorito.",
    );
    await expect(favoriteButton).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
