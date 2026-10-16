import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/react-query";

import { removeCartItem } from "../api/remove-cart-item";
import { synchronizeCartCache } from "../cart-cache";

export function removeCartItemMutationOptions(
  queryClient: QueryClient,
  ownerId: string,
) {
  return mutationOptions({
    mutationFn: (itemId: string) =>
      removeCartItem(ownerId, itemId),
    onSuccess: (cart) => {
      synchronizeCartCache(queryClient, cart);
    },
  });
}
