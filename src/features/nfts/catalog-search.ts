import {
  nftCategoryOptions,
  nftNetworkOptions,
  nftPriceLimits,
  type NftCategory,
  type NftNetwork,
} from "./catalog-filters";

export type NftCatalogScenario = "empty";

const catalogTabs = [
  "all",
  "new",
  "trending",
] as const;

export type NftCatalogTab =
  (typeof catalogTabs)[number];

export type NftCatalogSearch = {
  readonly categories?: readonly NftCategory[];
  readonly maximumPrice?: number;
  readonly minimumPrice?: number;
  readonly network?: NftNetwork;
  readonly page?: number;
  readonly q?: string;
  readonly scenario?: NftCatalogScenario;
  readonly tab?: NftCatalogTab;
};

export type NftCatalogFilters = Pick<
  NftCatalogSearch,
  | "categories"
  | "maximumPrice"
  | "minimumPrice"
  | "network"
>;

function parseCategories(value: unknown) {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  const selectedValues = new Set(values);
  const categories = nftCategoryOptions
    .filter((option) =>
      selectedValues.has(option.value),
    )
    .map((option) => option.value);

  return categories.length > 0
    ? categories
    : undefined;
}

function isNftNetwork(
  value: unknown,
): value is NftNetwork {
  return (
    typeof value === "string" &&
    nftNetworkOptions.some(
      (option) => option.value === value,
    )
  );
}

function parsePrice(value: unknown) {
  const parsedValue =
    typeof value === "number"
      ? value
      : typeof value === "string" &&
          value.trim() !== ""
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(parsedValue) &&
    parsedValue >= nftPriceLimits.minimum &&
    parsedValue <= nftPriceLimits.maximum
    ? parsedValue
    : undefined;
}

function isCatalogTab(
  value: unknown,
): value is NftCatalogTab {
  return (
    typeof value === "string" &&
    catalogTabs.some((tab) => tab === value)
  );
}

function parsePage(value: unknown) {
  const parsedValue =
    typeof value === "number"
      ? value
      : typeof value === "string" &&
          value.trim() !== ""
        ? Number(value)
        : Number.NaN;

  return Number.isInteger(parsedValue) &&
    parsedValue > 1
    ? parsedValue
    : undefined;
}

export function validateNftCatalogSearch(
  search: Record<string, unknown>,
): NftCatalogSearch {
  const categories = parseCategories(
    search.categories ?? search.category,
  );

  const network = isNftNetwork(search.network)
    ? search.network
    : undefined;

  const parsedMinimumPrice = parsePrice(
    search.minimumPrice,
  );

  const parsedMaximumPrice = parsePrice(
    search.maximumPrice,
  );

  const hasValidPriceRange =
    (parsedMinimumPrice ??
      nftPriceLimits.minimum) <=
    (parsedMaximumPrice ??
      nftPriceLimits.maximum);

  const minimumPrice =
    hasValidPriceRange &&
    parsedMinimumPrice !== undefined &&
    parsedMinimumPrice > nftPriceLimits.minimum
      ? parsedMinimumPrice
      : undefined;

  const maximumPrice =
    hasValidPriceRange &&
    parsedMaximumPrice !== undefined &&
    parsedMaximumPrice < nftPriceLimits.maximum
      ? parsedMaximumPrice
      : undefined;

  const query =
    typeof search.q === "string" &&
    search.q.trim() !== ""
      ? search.q.slice(0, 80)
      : undefined;

  const tab =
    isCatalogTab(search.tab) &&
    search.tab !== "all"
      ? search.tab
      : undefined;

  const page = parsePage(search.page);

  const scenario =
    search.scenario === "empty"
      ? search.scenario
      : undefined;

  return {
    ...(query ? { q: query } : {}),
    ...(tab ? { tab } : {}),
    ...(categories ? { categories } : {}),
    ...(network ? { network } : {}),
    ...(minimumPrice !== undefined
      ? { minimumPrice }
      : {}),
    ...(maximumPrice !== undefined
      ? { maximumPrice }
      : {}),
    ...(page ? { page } : {}),
    ...(scenario ? { scenario } : {}),
  };
}
