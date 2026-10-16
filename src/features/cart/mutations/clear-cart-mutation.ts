import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/react-query";

import { clearCart } from "../api/clear-cart";
import { synchronizeCartCache } from "../cart-cache";

export function clearCartMutationOptions(
  queryClient: QueryClient,
  ownerId: string,
) {
  return mutationOptions({
    mutationFn: () => clearCart(ownerId),
    onSuccess: (cart) => {
      synchronizeCartCache(queryClient, cart);
    },
  });
}
