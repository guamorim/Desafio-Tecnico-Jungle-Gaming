import { httpClient } from "@/lib/http-client";

import type {
  NftCatalogScenario,
  NftCatalogTab,
} from "../catalog-search";
import type { ListNftsResponse } from "../types";

export type ListNftsParams = {
  readonly page?: number;
  readonly q?: string;
  readonly scenario?: NftCatalogScenario;
  readonly tab?: NftCatalogTab;
};

type ListNftsOptions = {
  readonly signal?: AbortSignal;
};

export async function listNfts(
  {
    page,
    q,
    scenario,
    tab,
  }: ListNftsParams = {},
  {
    signal,
  }: ListNftsOptions = {},
): Promise<ListNftsResponse> {
  const { data } =
    await httpClient.get<ListNftsResponse>(
      "/nfts",
      {
        params: {
          page,
          q,
          scenario,
          tab,
        },
        signal,
      },
    );

  return data;
}
