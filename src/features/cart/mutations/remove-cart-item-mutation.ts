import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/react-query";

import { removeCartItem } from "../api/remove-cart-item";
import { synchronizeCartCache } from "../cart-cache";

export function removeCartItemMutationOptions(
  queryClient: QueryClient,
) {
  return mutationOptions({
    mutationFn: removeCartItem,
    onSuccess: (cart) => {
      synchronizeCartCache(queryClient, cart);
    },
  });
}
