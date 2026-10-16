import { expect, test } from "@playwright/test";

test.describe("detalhes do NFT", () => {
  test("abre diretamente e troca a edição selecionada", async ({
    page,
  }) => {
    await page.goto("/nfts/nft-aurora-ape");

    await expect(
      page.getByRole("heading", {
        name: "Aurora Ape",
        exact: true,
      }),
    ).toBeVisible();

    const editionGroup = page.getByRole("group", {
      name: "Edição:",
    });

    await expect(
      editionGroup.getByRole("radio", {
        name: "1/50",
        exact: true,
      }),
    ).toBeChecked();

    await editionGroup
      .getByText("1/10", { exact: true })
      .click();

    await expect(
      editionGroup.getByRole("radio", {
        name: "1/10",
        exact: true,
      }),
    ).toBeChecked();
    await expect(
      page.getByRole("img", {
        name: "Obra Aurora Ape",
      }),
    ).toHaveAttribute(
      "src",
      "/images/nfts/aurora-ape-1-10.webp",
    );
    await expect(
      page.getByText("0.25 ETH", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("informa quando uma edição está esgotada", async ({
    page,
  }) => {
    await page.goto("/nfts/nft-aurora-ape");

    const editionGroup = page.getByRole("group", {
      name: "Edição:",
    });

    await editionGroup
      .getByText("1/1", { exact: true })
      .click();

    await expect(
      editionGroup.getByRole("radio", {
        name: /1\/1.*esgotada/,
      }),
    ).toBeChecked();
    await expect(
      editionGroup.getByRole("status"),
    ).toHaveText("Edição indisponível");
    await expect(
      page.getByRole("button", {
        name: "Comprar NFT",
      }),
    ).toBeHidden();
  });

  test("apresenta o estado 404 para NFT inexistente", async ({
    page,
  }) => {
    await page.goto("/nfts/nft-inexistente");

    await expect(
      page.getByText("Erro 404", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "NFT não encontrado",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: "Voltar ao mercado",
      }),
    ).toBeVisible();
  });
});
