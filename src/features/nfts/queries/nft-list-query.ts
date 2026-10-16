import { queryOptions } from "@tanstack/react-query";

import { listNfts } from "../api/list-nfts";

export const nftListQueryOptions = queryOptions({
  queryKey: ["nfts", "list"] as const,
  queryFn: listNfts,
});
