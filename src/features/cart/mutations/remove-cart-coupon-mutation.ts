import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/react-query";

import { removeCartCoupon } from "../api/remove-cart-coupon";
import { synchronizeCartCache } from "../cart-cache";

export function removeCartCouponMutationOptions(
  queryClient: QueryClient,
) {
  return mutationOptions({
    mutationFn: removeCartCoupon,
    onSuccess: (cart) => {
      synchronizeCartCache(queryClient, cart);
    },
  });
}
