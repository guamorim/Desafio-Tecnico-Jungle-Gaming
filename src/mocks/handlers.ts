import { delay, http, HttpResponse } from "msw";

import {
  nftCatalogTabOptions,
  nftSortOptions,
  type NftCatalogSort,
  type NftCatalogTab,
} from "@/features/nfts/catalog-filters";
import type {
  ListNftsResponse,
  NftSummary,
} from "@/features/nfts/types";
import { nftFixtures } from "./fixtures/nfts";

const pageSize = 9;
const newReleaseCutoff = Date.parse(
  "2026-10-07T00:00:00.000Z",
);

type NftFilters = {
  readonly categories: readonly string[];
  readonly maximumPrice: number | undefined;
  readonly minimumPrice: number | undefined;
  readonly network: string | null;
  readonly searchQuery: string;
  readonly tab: NftCatalogTab;
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

function parseSort(
  value: string | null,
): NftCatalogSort {
  return (
    nftSortOptions.find(
      (option) => option.value === value,
    )?.value ?? "recent"
  );
}

function parseTab(
  value: string | null,
): NftCatalogTab {
  return (
    nftCatalogTabOptions.find(
      (option) => option.value === value,
    )?.value ?? "all"
  );
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

function sortNfts(
  items: readonly NftSummary[],
  sort: NftCatalogSort,
) {
  return [...items].sort((left, right) => {
    if (sort === "price-asc") {
      return (
        Number(left.startingPriceEth) -
        Number(right.startingPriceEth)
      );
    }

    if (sort === "price-desc") {
      return (
        Number(right.startingPriceEth) -
        Number(left.startingPriceEth)
      );
    }

    return (
      Date.parse(right.listedAt) -
      Date.parse(left.listedAt)
    );
  });
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

function matchesCatalogTab(
  nft: NftSummary,
  tab: NftCatalogTab,
) {
  if (tab === "new") {
    return (
      Date.parse(nft.listedAt) >=
      newReleaseCutoff
    );
  }

  if (tab === "trending") {
    return nft.isTrending;
  }

  return true;
}

function matchesNftFilters(
  nft: NftSummary,
  filters: NftFilters,
) {
  const nftPrice = Number(
    nft.startingPriceEth,
  );

  return (
    matchesCatalogTab(nft, filters.tab) &&
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
    const sort = parseSort(
      url.searchParams.get("sort"),
    );
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
      tab: parseTab(
        url.searchParams.get("tab"),
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

    const sortedNfts = sortNfts(
      matchingNfts,
      sort,
    );

    return HttpResponse.json(
      paginateNfts(sortedNfts, page),
    );
  }),
];
