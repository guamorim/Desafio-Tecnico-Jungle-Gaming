import { queryOptions } from "@tanstack/react-query";

import { getNft } from "../api/get-nft";

export function nftDetailQueryOptions(nftId: string) {
  return queryOptions({
    queryKey: ["nfts", "detail", nftId] as const,
    queryFn: ({ signal }) => getNft(nftId, { signal }),
  });
}
