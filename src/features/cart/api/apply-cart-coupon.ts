import { httpClient } from "@/lib/http-client";

import type {
  ApplyCartCouponInput,
  CartResponse,
} from "../types";

export async function applyCartCoupon(
  ownerId: string,
  input: ApplyCartCouponInput,
): Promise<CartResponse> {
  const { data } = await httpClient.post<CartResponse>(
    "/cart/coupon",
    input,
    {
      headers: {
        "X-Cart-Owner-Id": ownerId,
      },
    },
  );

  return data;
}
