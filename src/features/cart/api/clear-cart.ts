import { httpClient } from "@/lib/http-client";

import type { CartResponse } from "../types";

export async function clearCart(
  ownerId: string,
): Promise<CartResponse> {
  const { data } = await httpClient.delete<CartResponse>(
    "/cart/items",
    {
      headers: {
        "X-Cart-Owner-Id": ownerId,
      },
    },
  );

  return data;
}
