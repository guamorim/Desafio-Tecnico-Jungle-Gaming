import { httpClient } from "@/lib/http-client";

import { getGuestOwnerId } from "../guest-owner";
import type { CartResponse } from "../types";

export async function removeCartItem(
  itemId: string,
): Promise<CartResponse> {
  const encodedItemId = encodeURIComponent(itemId);
  const { data } = await httpClient.delete<CartResponse>(
    `/cart/items/${encodedItemId}`,
    {
      headers: {
        "X-Cart-Owner-Id": getGuestOwnerId(),
      },
    },
  );

  return data;
}
