import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/react-query";

import { removeCartCoupon } from "../api/remove-cart-coupon";
import { synchronizeCartCache } from "../cart-cache";

export function removeCartCouponMutationOptions(
  queryClient: QueryClient,
  ownerId: string,
) {
  return mutationOptions({
    mutationFn: () => removeCartCoupon(ownerId),
    onSuccess: (cart) => {
      synchronizeCartCache(queryClient, cart);
    },
  });
}
