import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/react-query";

import { clearCart } from "../api/clear-cart";
import { synchronizeCartCache } from "../cart-cache";

export function clearCartMutationOptions(
  queryClient: QueryClient,
) {
  return mutationOptions({
    mutationFn: clearCart,
    onSuccess: (cart) => {
      synchronizeCartCache(queryClient, cart);
    },
  });
}
