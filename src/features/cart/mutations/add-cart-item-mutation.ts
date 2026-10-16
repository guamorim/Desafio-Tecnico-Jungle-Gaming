import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/react-query";

import { addCartItem } from "../api/add-cart-item";
import { cartQueryKey } from "../queries/cart-query";

export function addCartItemMutationOptions(
  queryClient: QueryClient,
) {
  return mutationOptions({
    mutationFn: addCartItem,
    onSuccess: (cart) => {
      queryClient.setQueryData(
        cartQueryKey(cart.ownerId),
        cart,
      );
    },
  });
}
