import { httpClient } from "@/lib/http-client";

import type { CartResponse } from "../types";

export async function mergeGuestCart(
  guestOwnerId: string,
): Promise<CartResponse> {
  const { data } = await httpClient.post<CartResponse>(
    "/cart/merge",
    undefined,
    {
      headers: {
        "X-Cart-Owner-Id": guestOwnerId,
      },
    },
  );

  return data;
}
