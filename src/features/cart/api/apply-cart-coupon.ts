import { httpClient } from "@/lib/http-client";

import { getGuestOwnerId } from "../guest-owner";
import type {
  ApplyCartCouponInput,
  CartResponse,
} from "../types";

export async function applyCartCoupon(
  input: ApplyCartCouponInput,
): Promise<CartResponse> {
  const { data } = await httpClient.post<CartResponse>(
    "/cart/coupon",
    input,
    {
      headers: {
        "X-Cart-Owner-Id": getGuestOwnerId(),
      },
    },
  );

  return data;
}
