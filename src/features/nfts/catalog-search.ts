export type NftCatalogScenario = "empty";

const catalogTabs = [
  "all",
  "new",
  "trending",
] as const;

export type NftCatalogTab =
  (typeof catalogTabs)[number];

export type NftCatalogSearch = {
  readonly page?: number;
  readonly q?: string;
  readonly scenario?: NftCatalogScenario;
  readonly tab?: NftCatalogTab;
};

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
    ...(page ? { page } : {}),
    ...(scenario ? { scenario } : {}),
  };
}
