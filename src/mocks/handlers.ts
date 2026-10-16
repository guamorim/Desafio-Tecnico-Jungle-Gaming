import { delay, http, HttpResponse } from "msw";

import type { ListNftsResponse } from "@/features/nfts/types";
import { nftFixtures } from "./fixtures/nfts";

const pageSize = 8;

export const handlers = [
  http.get("/api/nfts", async () => {
    await delay(500);

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
