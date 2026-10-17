import { expect, test } from "@playwright/test";

test.describe("acessibilidade e resiliência", () => {
  test("mantém o foco no diálogo e o devolve ao acionador", async ({
    page,
  }) => {
    await page.goto("/profile");

    const loginTrigger = page
      .locator("section")
      .filter({
        has: page.getByRole("heading", {
          name: "Entre para acessar seu perfil",
        }),
      })
      .getByRole("button", {
        name: "Entrar",
        exact: true,
      });

    await loginTrigger.focus();
    await expect(loginTrigger).toBeFocused();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog", {
      name: "Entrar",
    });
    const emailInput = dialog.getByLabel("E-mail");

    await expect(dialog).toBeVisible();
    await expect(emailInput).toBeFocused();

    for (let index = 0; index < 12; index += 1) {
      await page.keyboard.press("Tab");
      await expect
        .poll(() =>
          dialog.evaluate((element) =>
          element.contains(
            element.ownerDocument.activeElement,
          ),
          ),
        )
        .toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(loginTrigger).toBeFocused();
  });

  test("opera abas e drawer de filtros pelo teclado", async ({
    page,
  }, testInfo) => {
    await page.goto("/");

    const allTab = page.getByRole("tab", {
      name: "Todos os NFTs",
    });
    const newTab = page.getByRole("tab", {
      name: "Novos lançamentos",
    });

    await allTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(newTab).toBeFocused();
    await expect(newTab).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page).toHaveURL(/(?:\?|&)tab=new(?:&|$)/);

    if (testInfo.project.name !== "mobile-chromium") {
      return;
    }

    const filterTrigger = page.getByRole("button", {
      name: "Abrir filtros",
    });

    await filterTrigger.focus();
    await page.keyboard.press("Enter");

    const drawer = page.getByRole("dialog", {
      name: "Filtrar catálogo",
    });

    await expect(drawer).toBeVisible();

    for (let index = 0; index < 8; index += 1) {
      await page.keyboard.press("Tab");
      await expect
        .poll(() =>
          drawer.evaluate((element) =>
          element.contains(
            element.ownerDocument.activeElement,
          ),
          ),
        )
        .toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(filterTrigger).toBeFocused();
  });

  test("exibe skeleton durante carregamento lento", async ({
    page,
  }) => {
    await page.goto("/?scenario=slow");
    const catalog = page.getByRole("tabpanel");

    await expect(
      catalog.getByRole("status").filter({
        hasText: "Carregando NFTs...",
      }),
    ).toBeVisible();

    await expect(
      catalog.getByRole("heading", {
        name: "Aurora Ape",
        exact: true,
      }),
    ).toBeVisible();
  });

  test("recupera o catálogo após uma falha temporária", async ({
    page,
  }) => {
    await page.goto("/?scenario=recoverable-error");
    const catalog = page.getByRole("tabpanel");

    await expect(
      catalog.getByRole("alert"),
    ).toContainText(
      "Não foi possível carregar os NFTs.",
    );

    await catalog
      .getByRole("button", {
        name: "Tentar novamente",
      })
      .click();

    await expect(
      catalog.getByRole("heading", {
        name: "Aurora Ape",
        exact: true,
      }),
    ).toBeVisible();
  });
});
