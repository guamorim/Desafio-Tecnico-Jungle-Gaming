import { queryOptions } from "@tanstack/react-query";

import {
  listNfts,
  type ListNftsParams,
} from "../api/list-nfts";

export function nftListQueryOptions(
  params: ListNftsParams = {},
) {
  return queryOptions({
    queryKey: ["nfts", "list", params] as const,
    queryFn: () => listNfts(params),
  });
}
