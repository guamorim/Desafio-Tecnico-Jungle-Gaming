import { httpClient } from "@/lib/http-client";

import type {
  FavoriteNftsResponse,
  NftSummary,
} from "../types";

export async function listFavoriteNfts(
  signal?: AbortSignal,
): Promise<FavoriteNftsResponse> {
  const { data } =
    await httpClient.get<FavoriteNftsResponse>(
      "/favorites",
      { signal },
    );

  return data;
}

export async function addFavoriteNft(
  nftId: string,
): Promise<NftSummary> {
  const { data } = await httpClient.post<NftSummary>(
    `/favorites/${encodeURIComponent(nftId)}`,
  );

  return data;
}

export async function removeFavoriteNft(
  nftId: string,
): Promise<NftSummary> {
  const { data } = await httpClient.delete<NftSummary>(
    `/favorites/${encodeURIComponent(nftId)}`,
  );

  return data;
}
