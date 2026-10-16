import type { NftDetail } from "../types";
import { httpClient } from "@/lib/http-client";

type GetNftOptions = {
  readonly signal?: AbortSignal;
};

export async function getNft(
  nftId: string,
  options: GetNftOptions = {},
): Promise<NftDetail> {
  const { data } = await httpClient.get<NftDetail>(
    `/nfts/${encodeURIComponent(nftId)}`,
    { signal: options.signal },
  );

  return data;
}
