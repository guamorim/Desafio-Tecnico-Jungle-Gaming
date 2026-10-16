import { queryOptions } from "@tanstack/react-query";

import { getCart } from "../api/get-cart";

export const cartQueryKey = (ownerId: string) =>
  ["cart", ownerId] as const;

export function cartQueryOptions(ownerId: string) {
  return queryOptions({
    queryKey: cartQueryKey(ownerId),
    queryFn: () => getCart(ownerId),
  });
}
