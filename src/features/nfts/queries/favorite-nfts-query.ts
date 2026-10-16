import { queryOptions } from "@tanstack/react-query";

import { listFavoriteNfts } from "../api/favorites-api";
import { favoriteNftsQueryKey } from "./nft-query-keys";

export function favoriteNftsQueryOptions(userId: string) {
  return queryOptions({
    queryKey: favoriteNftsQueryKey(userId),
    queryFn: ({ signal }) => listFavoriteNfts(signal),
  });
}
