import { delay, http, HttpResponse } from "msw";

import type {
  ListNftsResponse,
  NftSummary,
} from "@/features/nfts/types";
import { nftFixtures } from "./fixtures/nfts";

const pageSize = 9;

function parsePage(value: string | null) {
  if (value === null) {
    return 1;
  }

  const parsedPage = Number(value);

  return Number.isInteger(parsedPage) &&
    parsedPage > 0
    ? parsedPage
    : 1;
}

function paginateNfts(
  items: readonly NftSummary[],
  page: number,
): ListNftsResponse {
  const startIndex = (page - 1) * pageSize;

  return {
    items: items.slice(
      startIndex,
      startIndex + pageSize,
    ),
    pagination: {
      page,
      pageSize,
      totalItems: items.length,
      totalPages: Math.ceil(
        items.length / pageSize,
      ),
    },
  };
}

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function matchesNftSearch(
  nft: NftSummary,
  searchQuery: string,
) {
  const searchableText = [
    nft.name,
    nft.creatorName,
    nft.collectionName,
  ].join(" ");

  return normalizeSearchValue(
    searchableText,
  ).includes(searchQuery);
}

export const handlers = [
  http.get("/api/nfts", async ({ request }) => {
    const url = new URL(request.url);
    const page = parsePage(
      url.searchParams.get("page"),
    );
    const scenario = url.searchParams.get("scenario");
    const searchQuery = normalizeSearchValue(
      url.searchParams.get("q") ?? "",
    );

    await delay(500);

    if (scenario === "empty") {
      return HttpResponse.json(
        paginateNfts([], page),
      );
    }

    const matchingNfts =
      searchQuery === ""
        ? nftFixtures
        : nftFixtures.filter((nft) =>
            matchesNftSearch(nft, searchQuery),
          );

    return HttpResponse.json(
      paginateNfts(matchingNfts, page),
    );
  }),
];
