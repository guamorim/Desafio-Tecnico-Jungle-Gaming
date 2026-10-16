import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/react-query";

import { addCartItem } from "../api/add-cart-item";
import { synchronizeCartCache } from "../cart-cache";

export function addCartItemMutationOptions(
  queryClient: QueryClient,
  ownerId: string | null,
) {
  return mutationOptions({
    mutationFn: (input: Parameters<typeof addCartItem>[1]) => {
      if (!ownerId) {
        throw new Error(
          "Aguarde a identificação do carrinho.",
        );
      }

      return addCartItem(ownerId, input);
    },
    onSuccess: (cart) => {
      synchronizeCartCache(queryClient, cart);
    },
  });
}
