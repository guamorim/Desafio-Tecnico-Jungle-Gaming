import { queryOptions } from "@tanstack/react-query";

import { getCart } from "../api/get-cart";

export const cartQueryKey = (ownerId: string | null) =>
  ["cart", ownerId] as const;

export function cartQueryOptions(
  ownerId: string | null,
) {
  return queryOptions({
    queryKey: cartQueryKey(ownerId),
    queryFn: () => {
      if (!ownerId) {
        throw new Error(
          "O proprietário do carrinho ainda não foi definido.",
        );
      }

      return getCart(ownerId);
    },
    enabled: ownerId !== null,
  });
}
