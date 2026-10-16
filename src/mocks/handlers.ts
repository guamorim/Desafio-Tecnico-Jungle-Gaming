import { delay, http, HttpResponse } from "msw";

import type { ListNftsResponse } from "@/features/nfts/types";
import { nftFixtures } from "./fixtures/nfts";

const pageSize = 8;

const emptyListResponse = {
  items: [],
  pagination: {
    page: 1,
    pageSize,
    totalItems: 0,
    totalPages: 0,
  },
} as const satisfies ListNftsResponse;

export const handlers = [
  http.get("/api/nfts", async ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get("scenario");

    await delay(500);

    if (scenario === "empty") {
      return HttpResponse.json(emptyListResponse);
    }

    const response = {
      items: nftFixtures,
      pagination: {
        page: 1,
        pageSize,
        totalItems: nftFixtures.length,
        totalPages: Math.ceil(nftFixtures.length / pageSize),
      },
    } satisfies ListNftsResponse;

    return HttpResponse.json(response);
  }),
];
