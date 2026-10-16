import { httpClient } from "@/lib/http-client";

import type { ListNftsResponse } from "../types";

export type NftCatalogScenario = "empty";

export type ListNftsParams = {
  readonly scenario?: NftCatalogScenario;
};

export async function listNfts(
  { scenario }: ListNftsParams = {},
): Promise<ListNftsResponse> {
  const { data } = await httpClient.get<ListNftsResponse>("/nfts", {
    params: {
      scenario,
    },
  });

  return data;
}
