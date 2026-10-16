import { httpClient } from "@/lib/http-client";

import { getGuestOwnerId } from "../guest-owner";
import type { CartResponse } from "../types";

export async function removeCartCoupon(): Promise<CartResponse> {
  const { data } = await httpClient.delete<CartResponse>(
    "/cart/coupon",
    {
      headers: {
        "X-Cart-Owner-Id": getGuestOwnerId(),
      },
    },
  );

  return data;
}
