import {
  expect,
  test,
  type Locator,
  type Page,
} from "@playwright/test";

import {
  loginWithAccount,
  loginWithFixture,
  logoutFromProfile,
  secondFixtureAccount,
} from "./helpers/auth.js";

const avatarPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

const primaryAddress = `0x${"1".repeat(40)}`;
const secondaryAddress = `0x${"2".repeat(40)}`;

function walletSection(
  page: Page,
  kind: "primary" | "secondary",
): Locator {
  return page.locator(
    `section[aria-labelledby="${kind}-wallet-title"]`,
  );
}

async function openWallets(page: Page) {
  await page
    .getByRole("link", { name: "Carteiras", exact: true })
    .click();
  await expect(page).toHaveURL("/wallets");
  await expect(
    page.getByRole("heading", {
      name: "Carteiras do colecionador",
    }),
  ).toBeVisible();
}

async function createPrimaryWallet(
  page: Page,
  address = primaryAddress,
) {
  const primary = walletSection(page, "primary");

  await primary
    .getByLabel("Endereço da carteira")
    .fill(address);
  await primary
    .getByRole("button", { name: "Adicionar principal" })
    .click();

  await expect(primary.getByRole("status")).toHaveText(
    "Carteira principal salva com sucesso.",
  );
}

test.describe("avatar do colecionador", () => {
  test.beforeEach(async ({ page }) => {
    await loginWithFixture(page);
  });

  test("envia, persiste e remove o avatar", async ({
    page,
  }) => {
    await page
      .getByLabel("Selecionar imagem do avatar")
      .setInputFiles({
        name: "avatar.png",
        mimeType: "image/png",
        buffer: avatarPng,
      });

    await expect(page.getByRole("status")).toHaveText(
      "Avatar atualizado com sucesso.",
    );
    await expect(
      page.getByRole("img", { name: "Avatar de Ana Sato" }),
    ).toBeVisible();

    await page.reload();

    await expect(
      page.getByRole("img", { name: "Avatar de Ana Sato" }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Remover avatar" })
      .click();

    await expect(page.getByRole("status")).toHaveText(
      "Avatar removido com sucesso.",
    );
    await expect(
      page.getByRole("img", { name: "Avatar de Ana Sato" }),
    ).toHaveCount(0);
  });

  test("rejeita um arquivo que não é imagem", async ({
    page,
  }) => {
    await page
      .getByLabel("Selecionar imagem do avatar")
      .setInputFiles({
        name: "avatar.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("não é uma imagem"),
      });

    await expect(page.getByRole("alert")).toHaveText(
      "Envie uma imagem PNG, JPEG ou WebP.",
    );
  });
});

test.describe("carteiras do colecionador", () => {
  test("protege a rota de carteiras", async ({ page }) => {
    await page.goto("/wallets");

    await expect(
      page.getByRole("heading", {
        name: "Entre para acessar suas carteiras",
      }),
    ).toBeVisible();
  });

  test("cria, edita e persiste a carteira principal", async ({
    page,
  }) => {
    await loginWithFixture(page);
    await openWallets(page);
    await createPrimaryWallet(page);

    const primary = walletSection(page, "primary");
    await primary
      .getByLabel("Apelido da carteira")
      .fill("Cofre principal");
    await primary
      .getByRole("button", { name: "Salvar carteira" })
      .click();

    await expect(primary.getByRole("status")).toHaveText(
      "Carteira principal salva com sucesso.",
    );

    await page.reload();

    await expect(
      walletSection(page, "primary").getByLabel(
        "Apelido da carteira",
      ),
    ).toHaveValue("Cofre principal");
    await expect(
      walletSection(page, "primary").getByLabel(
        "Endereço da carteira",
      ),
    ).toHaveValue(primaryAddress);
  });

  test("valida endereço duplicado e cadastra a carteira secundária", async ({
    page,
  }) => {
    await loginWithFixture(page);
    await openWallets(page);
    await createPrimaryWallet(page);

    const secondary = walletSection(page, "secondary");
    const addressInput = secondary.getByLabel(
      "Endereço da carteira",
    );

    await addressInput.fill(primaryAddress);
    await secondary
      .getByRole("button", { name: "Adicionar secundária" })
      .click();

    await expect(
      secondary.getByText("Este endereço já está cadastrado."),
    ).toBeVisible();

    await addressInput.fill(secondaryAddress);
    await secondary
      .getByRole("button", { name: "Adicionar secundária" })
      .click();

    await expect(secondary.getByRole("status")).toHaveText(
      "Carteira secundária salva com sucesso.",
    );

    await page.reload();
    await expect(
      walletSection(page, "secondary").getByLabel(
        "Endereço da carteira",
      ),
    ).toHaveValue(secondaryAddress);
  });

  test("isola as carteiras ao trocar de conta", async ({
    page,
  }) => {
    await loginWithFixture(page);
    await openWallets(page);
    await createPrimaryWallet(page);
    await logoutFromProfile(page);

    await loginWithAccount(
      page,
      secondFixtureAccount.email,
      secondFixtureAccount.password,
    );
    await openWallets(page);

    await expect(
      walletSection(page, "primary").getByLabel(
        "Endereço da carteira",
      ),
    ).toHaveValue("");
  });
});
