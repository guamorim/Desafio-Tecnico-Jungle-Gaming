import { queryOptions } from "@tanstack/react-query";

import { getNft } from "../api/get-nft";
import { nftDetailQueryKey } from "./nft-query-keys";

export function nftDetailQueryOptions(
  nftId: string,
  viewerId: string | null = null,
) {
  return queryOptions({
    queryKey: [
      ...nftDetailQueryKey(viewerId),
      nftId,
    ] as const,
    queryFn: ({ signal }) => getNft(nftId, { signal }),
  });
}
