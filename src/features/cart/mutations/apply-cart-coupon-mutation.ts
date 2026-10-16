import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/react-query";

import { applyCartCoupon } from "../api/apply-cart-coupon";
import { synchronizeCartCache } from "../cart-cache";

export function applyCartCouponMutationOptions(
  queryClient: QueryClient,
  ownerId: string,
) {
  return mutationOptions({
    mutationFn: (
      input: Parameters<typeof applyCartCoupon>[1],
    ) => applyCartCoupon(ownerId, input),
    onSuccess: (cart) => {
      synchronizeCartCache(queryClient, cart);
    },
  });
}
