import { httpClient } from "@/lib/http-client";

import type {
  NftCatalogSearch,
} from "../catalog-search";
import type { ListNftsResponse } from "../types";

export type ListNftsParams = NftCatalogSearch;

type ListNftsOptions = {
  readonly signal?: AbortSignal;
};

export async function listNfts(
  params: ListNftsParams = {},
  {
    signal,
  }: ListNftsOptions = {},
): Promise<ListNftsResponse> {
  const { data } =
    await httpClient.get<ListNftsResponse>(
      "/nfts",
      {
        params: {
          ...params,
          categories:
            params.categories?.join(","),
        },
        signal,
      },
    );

  return data;
}
