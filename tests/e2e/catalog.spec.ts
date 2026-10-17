import {
  expect,
  test,
  type Page,
} from "@playwright/test";

function getSearchParameter(
  page: Page,
  name: string,
) {
  return new URL(page.url()).searchParams.get(name);
}

function getCatalogResults(page: Page) {
  return page.getByRole("tabpanel");
}

function getCatalogCards(page: Page) {
  return getCatalogResults(page).locator(
    'a[href^="/nfts/"] article',
  );
}

test.describe("catálogo", () => {
  test("pesquisa NFTs e mantém a busca na URL", async ({
    page,
  }, testInfo) => {
    await page.goto("/");

    if (testInfo.project.name === "desktop-chromium") {
      await page
        .getByRole("button", {
          name: "Abrir busca",
        })
        .click();
    }

    const searchForm = page
      .getByRole("search")
      .filter({ visible: true });
    const searchInput = searchForm.getByLabel("Buscar NFTs");

    await searchInput.fill("Maya K.");
    await searchInput.press("Enter");

    await expect
      .poll(() => getSearchParameter(page, "q"))
      .toBe("Maya K.");

    const results = getCatalogResults(page);

    await expect(
      results.getByRole("heading", {
        name: "Aurora Ape",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      results.getByRole("heading", {
        name: "Golden Beat",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      results.getByRole("heading", {
        name: "Ether Bloom",
        exact: true,
      }),
    ).toHaveCount(0);
  });

  test("combina múltiplas categorias com uma rede", async ({
    page,
  }) => {
    await page.goto(
      "/?categories=digital-art%2Cmusic&network=ethereum",
    );

    await expect
      .poll(() => getSearchParameter(page, "categories"))
      .toBe("digital-art,music");
    await expect
      .poll(() => getSearchParameter(page, "network"))
      .toBe("ethereum");

    const results = getCatalogResults(page);

    await expect(getCatalogCards(page)).toHaveCount(2);
    await expect(
      results.getByRole("heading", {
        name: "Aurora Ape",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      results.getByRole("heading", {
        name: "Golden Beat",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      results.getByRole("heading", {
        name: "Cyber Tiger",
        exact: true,
      }),
    ).toHaveCount(0);
  });

  test("ordena os NFTs pelo maior preço", async ({ page }) => {
    await page.goto("/");

    await page
      .getByLabel("Ordenar por:")
      .selectOption("price-desc");

    await expect
      .poll(() => getSearchParameter(page, "sort"))
      .toBe("price-desc");

    const firstCard = getCatalogCards(page).first();

    await expect(
      firstCard.getByRole("heading", {
        name: "Jungle Oracle",
        exact: true,
      }),
    ).toBeVisible();
    await expect(firstCard).toContainText("2.150 ETH");
  });

  test("navega por abas e páginas e restaura o histórico", async ({
    page,
  }) => {
    await page.goto("/");

    const trendingTab = page.getByRole("tab", {
      name: "Em alta",
    });

    await trendingTab.click();

    await expect(trendingTab).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect
      .poll(() => getSearchParameter(page, "tab"))
      .toBe("trending");
    await expect(
      getCatalogCards(page),
    ).toHaveCount(6);

    await page.goBack();

    await expect(
      page.getByRole("tab", {
        name: "Todos os NFTs",
      }),
    ).toHaveAttribute("aria-selected", "true");
    await expect
      .poll(() => getSearchParameter(page, "tab"))
      .toBeNull();

    await page
      .getByRole("navigation", {
        name: "Paginação do catálogo",
      })
      .getByRole("link", {
        name: "Ir para a página 2",
      })
      .click();

    await expect
      .poll(() => getSearchParameter(page, "page"))
      .toBe("2");
    await expect(
      getCatalogCards(page)
        .first()
        .getByRole("heading", {
          name: "Golden Beat",
          exact: true,
        }),
    ).toBeVisible();

    await page.goBack();

    await expect
      .poll(() => getSearchParameter(page, "page"))
      .toBeNull();
    await expect(
      getCatalogResults(page).getByRole("heading", {
        name: "Aurora Ape",
        exact: true,
      }),
    ).toBeVisible();
  });

  test("apresenta o estado vazio do catálogo", async ({
    page,
  }) => {
    await page.goto("/?scenario=empty");

    const results = getCatalogResults(page);

    await expect(
      results.getByRole("heading", {
        name: "No NFTs found",
      }),
    ).toBeVisible();
    await expect(getCatalogCards(page)).toHaveCount(0);
  });

  test("descarta uma resposta de busca que chegou fora de ordem", async ({
    page,
  }, testInfo) => {
    await page.goto("/?scenario=out-of-order");

    await expect(
      getCatalogResults(page).getByRole("heading", {
        name: "Aurora Ape",
        exact: true,
      }),
    ).toBeVisible();

    async function submitSearch(value: string) {
      if (testInfo.project.name === "desktop-chromium") {
        await page
          .getByRole("button", { name: "Abrir busca" })
          .click();
      }

      const searchInput = page
        .getByRole("search")
        .filter({ visible: true })
        .getByLabel("Buscar NFTs");
      const requestStarted = page.waitForRequest((request) => {
        const url = new URL(request.url());

        return (
          url.pathname === "/api/nfts" &&
          url.searchParams.get("q") === value
        );
      });

      await searchInput.fill(value);
      await searchInput.press("Enter");
      await requestStarted;
    }

    await submitSearch("Aurora Ape");
    await expect
      .poll(() => getSearchParameter(page, "q"))
      .toBe("Aurora Ape");

    await submitSearch("Cyber Tiger");
    await expect
      .poll(() => getSearchParameter(page, "q"))
      .toBe("Cyber Tiger");

    const results = getCatalogResults(page);

    await expect(
      results.getByRole("heading", {
        name: "Cyber Tiger",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      results.getByRole("heading", {
        name: "Aurora Ape",
        exact: true,
      }),
    ).toHaveCount(0);

    await page.waitForTimeout(1_500);

    await expect(
      results.getByRole("heading", {
        name: "Cyber Tiger",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      results.getByRole("heading", {
        name: "Aurora Ape",
        exact: true,
      }),
    ).toHaveCount(0);
  });
});
