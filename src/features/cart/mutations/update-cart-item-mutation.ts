import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/react-query";

import { updateCartItem } from "../api/update-cart-item";
import { synchronizeCartCache } from "../cart-cache";

export function updateCartItemMutationOptions(
  queryClient: QueryClient,
) {
  return mutationOptions({
    mutationFn: updateCartItem,
    onSuccess: (cart) => {
      synchronizeCartCache(queryClient, cart);
    },
  });
}
