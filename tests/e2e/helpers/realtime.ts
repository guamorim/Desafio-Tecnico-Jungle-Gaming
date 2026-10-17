import {
  expect,
  type Page,
} from "@playwright/test";

type NftRealtimeUpdate = {
  readonly priceEth?: string;
  readonly availableQuantity?: number;
  readonly includeDuplicateAndStale?: boolean;
};

export const auroraEditionId =
  "nft-aurora-ape-one-of-fifty";

export async function waitForRealtime(page: Page) {
  await expect(
    page.getByTestId("realtime-connection-status"),
  ).toHaveText("Tempo real conectado");
}

export async function updateAuroraInRealtime(
  page: Page,
  update: NftRealtimeUpdate,
) {
  const result = await page.evaluate(
    async ({ editionId, payload }) => {
      const response = await fetch(
        `/api/mock/realtime/nfts/nft-aurora-ape/editions/${editionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      return {
        ok: response.ok,
        status: response.status,
        body: await response.text(),
      };
    },
    { editionId: auroraEditionId, payload: update },
  );

  expect(
    result.ok,
    `O controle do mock respondeu ${result.status}: ${result.body}`,
  ).toBe(true);
}

export async function interruptRealtime(
  page: Page,
  durationMs = 2_500,
) {
  const result = await page.evaluate(async (duration) => {
    const response = await fetch(
      "/api/mock/realtime/disconnect",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ durationMs: duration }),
      },
    );

    return {
      ok: response.ok,
      status: response.status,
      body: await response.text(),
    };
  }, durationMs);

  expect(
    result.ok,
    `O controle do mock respondeu ${result.status}: ${result.body}`,
  ).toBe(true);
}
