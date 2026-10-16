import { queryOptions } from "@tanstack/react-query";

import {
  listNfts,
  type ListNftsParams,
} from "../api/list-nfts";
import { nftListQueryKey } from "./nft-query-keys";

export function nftListQueryOptions(
  params: ListNftsParams = {},
  viewerId: string | null = null,
) {
  return queryOptions({
    queryKey: [
      ...nftListQueryKey(viewerId),
      params,
    ] as const,
    queryFn: ({ signal }) =>
      listNfts(params, { signal }),
  });
}
