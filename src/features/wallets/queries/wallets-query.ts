import { queryOptions } from "@tanstack/react-query";

import { listWallets } from "../api/wallets-api";

export function walletsQueryKey(userId: string) {
  return ["wallets", userId] as const;
}

export function walletsQueryOptions(userId: string) {
  return queryOptions({
    queryKey: walletsQueryKey(userId),
    queryFn: ({ signal }) => listWallets(signal),
  });
}
