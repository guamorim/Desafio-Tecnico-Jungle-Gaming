import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/react-query";

import { applyCartCoupon } from "../api/apply-cart-coupon";
import { synchronizeCartCache } from "../cart-cache";

export function applyCartCouponMutationOptions(
  queryClient: QueryClient,
) {
  return mutationOptions({
    mutationFn: applyCartCoupon,
    onSuccess: (cart) => {
      synchronizeCartCache(queryClient, cart);
    },
  });
}
