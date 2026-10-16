import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/react-query";

import { updateCartItem } from "../api/update-cart-item";
import { synchronizeCartCache } from "../cart-cache";

export function updateCartItemMutationOptions(
  queryClient: QueryClient,
  ownerId: string,
) {
  return mutationOptions({
    mutationFn: (input: Parameters<typeof updateCartItem>[1]) =>
      updateCartItem(ownerId, input),
    onSuccess: (cart) => {
      synchronizeCartCache(queryClient, cart);
    },
  });
}
