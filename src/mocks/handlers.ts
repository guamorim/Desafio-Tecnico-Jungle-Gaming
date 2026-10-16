import { delay, http, HttpResponse } from "msw";

import type {
  ListNftsResponse,
  NftSummary,
} from "@/features/nfts/types";
import { nftFixtures } from "./fixtures/nfts";

const pageSize = 9;

type NftFilters = {
  readonly categories: readonly string[];
  readonly maximumPrice: number | undefined;
  readonly minimumPrice: number | undefined;
  readonly network: string | null;
  readonly searchQuery: string;
};

function parseOptionalNumber(
  value: string | null,
) {
  if (value === null || value.trim() === "") {
    return undefined;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : undefined;
}

function parseList(value: string | null) {
  return value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? [];
}

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

function matchesNftFilters(
  nft: NftSummary,
  filters: NftFilters,
) {
  const nftPrice = Number(
    nft.startingPriceEth,
  );

  return (
    (filters.searchQuery === "" ||
      matchesNftSearch(
        nft,
        filters.searchQuery,
      )) &&
    (filters.categories.length === 0 ||
      filters.categories.includes(
        nft.category,
      )) &&
    (filters.network === null ||
      filters.network === "" ||
      nft.network === filters.network) &&
    (filters.minimumPrice === undefined ||
      nftPrice >= filters.minimumPrice) &&
    (filters.maximumPrice === undefined ||
      nftPrice <= filters.maximumPrice)
  );
}

export const handlers = [
  http.get("/api/nfts", async ({ request }) => {
    const url = new URL(request.url);
    const page = parsePage(
      url.searchParams.get("page"),
    );
    const scenario = url.searchParams.get("scenario");
    const filters = {
      categories: parseList(
        url.searchParams.get("categories"),
      ),
      maximumPrice: parseOptionalNumber(
        url.searchParams.get("maximumPrice"),
      ),
      minimumPrice: parseOptionalNumber(
        url.searchParams.get("minimumPrice"),
      ),
      network: url.searchParams.get("network"),
      searchQuery: normalizeSearchValue(
        url.searchParams.get("q") ?? "",
      ),
    } satisfies NftFilters;

    await delay(500);

    if (scenario === "empty") {
      return HttpResponse.json(
        paginateNfts([], page),
      );
    }

    const matchingNfts = nftFixtures.filter(
      (nft) => matchesNftFilters(nft, filters),
    );

    return HttpResponse.json(
      paginateNfts(matchingNfts, page),
    );
  }),
];
