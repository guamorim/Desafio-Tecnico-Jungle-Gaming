import { httpClient } from "@/lib/http-client";

import type { CartResponse } from "../types";

export async function removeCartItem(
  ownerId: string,
  itemId: string,
): Promise<CartResponse> {
  const encodedItemId = encodeURIComponent(itemId);
  const { data } = await httpClient.delete<CartResponse>(
    `/cart/items/${encodedItemId}`,
    {
      headers: {
        "X-Cart-Owner-Id": ownerId,
      },
    },
  );

  return data;
}
