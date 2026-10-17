import {
  expect,
  test,
  type Page,
} from "@playwright/test";

import { loginWithFixture } from "./helpers/auth.js";
import { addAuroraToCart } from "./helpers/cart.js";
import { createPrimaryWallet } from "./helpers/wallet.js";

type BrowserImage = {
  readonly complete: boolean;
  readonly naturalWidth: number;
  decode: () => Promise<void>;
};

type BrowserGlobals = {
  readonly document: {
    readonly documentElement: {
      readonly scrollHeight: number;
    };
    readonly images: ArrayLike<BrowserImage>;
  };
  readonly innerHeight: number;
  requestAnimationFrame: (
    callback: () => void,
  ) => number;
  scrollTo: (x: number, y: number) => void;
};

const screenshotOptions = {
  animations: "disabled",
  caret: "hide",
  fullPage: true,
  maxDiffPixelRatio: 0.01,
  threshold: 0.2,
  timeout: 20_000,
} as const;

async function waitForVisualStability(page: Page) {
  await page.locator("img").evaluateAll((elements) => {
    for (const element of elements) {
      Reflect.set(element, "loading", "eager");
      Reflect.set(element, "decoding", "sync");
    }
  });

  await page.waitForLoadState("networkidle");
  await page.evaluate("document.fonts.ready");

  await page.waitForFunction(
    () => {
      const browser = globalThis as unknown as BrowserGlobals;

      return Array.from(browser.document.images).every(
        (image) =>
          image.complete && image.naturalWidth > 0,
      );
    },
    undefined,
    { timeout: 20_000 },
  );

  await page.evaluate(async () => {
    const browser = globalThis as unknown as BrowserGlobals;

    await Promise.all(
      Array.from(browser.document.images).map((image) =>
        image.decode().catch(() => undefined),
      ),
    );

    const nextPaint = () =>
      new Promise<void>((resolve) => {
        browser.requestAnimationFrame(() => resolve());
      });
    const viewportHeight = browser.innerHeight;
    const documentHeight =
      browser.document.documentElement.scrollHeight;

    for (
      let position = 0;
      position < documentHeight;
      position += viewportHeight
    ) {
      browser.scrollTo(0, position);
      await nextPaint();
      await nextPaint();
    }

    browser.scrollTo(0, 0);
    await nextPaint();
    await nextPaint();
  });
}

test.describe("regressão visual", () => {
  test("início", async ({ page }) => {
    await page.goto("/");

    await expect(
      page
        .getByRole("tabpanel")
        .getByRole("heading", {
          name: "Aurora Ape",
          exact: true,
        }),
    ).toBeVisible();
    await waitForVisualStability(page);

    await expect(page).toHaveScreenshot(
      "home.png",
      screenshotOptions,
    );
  });

  test("detalhe do NFT", async ({ page }) => {
    await page.goto("/nfts/nft-aurora-ape");

    await expect(
      page.getByRole("heading", {
        name: "Aurora Ape",
        exact: true,
      }),
    ).toBeVisible();
    await waitForVisualStability(page);

    await expect(page).toHaveScreenshot(
      "nft-detail.png",
      screenshotOptions,
    );
  });

  test("carrinho", async ({ page }) => {
    await addAuroraToCart(page, 2);
    await page.goto("/cart");

    await expect(
      page.getByRole("heading", {
        name: "Carrinho de NFTs",
      }),
    ).toBeVisible();
    await waitForVisualStability(page);

    await expect(page).toHaveScreenshot(
      "cart.png",
      screenshotOptions,
    );
  });

  test("pagamento", async ({ page }) => {
    await loginWithFixture(page);
    await createPrimaryWallet(page);
    await addAuroraToCart(page, 2);
    await page.goto("/checkout");

    await expect(
      page.getByRole("heading", {
        name: "Carteira e rede",
      }),
    ).toBeVisible();
    await waitForVisualStability(page);

    await expect(page).toHaveScreenshot(
      "checkout.png",
      screenshotOptions,
    );
  });
});
