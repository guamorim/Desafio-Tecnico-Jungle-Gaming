import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/react-query";

import { addCartItem } from "../api/add-cart-item";
import { synchronizeCartCache } from "../cart-cache";

export function addCartItemMutationOptions(
  queryClient: QueryClient,
) {
  return mutationOptions({
    mutationFn: addCartItem,
    onSuccess: (cart) => {
      synchronizeCartCache(queryClient, cart);
    },
  });
}
