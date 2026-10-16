import { httpClient } from "@/lib/http-client";

import type { ListNftsResponse } from "../types";

export async function listNfts(): Promise<ListNftsResponse> {
  const { data } = await httpClient.get<ListNftsResponse>("/nfts");

  return data;
}
