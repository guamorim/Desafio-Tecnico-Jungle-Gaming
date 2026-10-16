import type { QueryClient } from "@tanstack/react-query";

import { cartQueryKey } from "./queries/cart-query";
import type { CartResponse } from "./types";

export function synchronizeCartCache(
  queryClient: QueryClient,
  cart: CartResponse,
) {
  queryClient.setQueryData(
    cartQueryKey(cart.ownerId),
    cart,
  );
}
