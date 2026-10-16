import { httpClient } from "@/lib/http-client";

import { getGuestOwnerId } from "../guest-owner";
import type {
  CartResponse,
  UpdateCartItemInput,
} from "../types";

export async function updateCartItem({
  itemId,
  quantity,
}: UpdateCartItemInput): Promise<CartResponse> {
  const encodedItemId = encodeURIComponent(itemId);
  const { data } = await httpClient.patch<CartResponse>(
    `/cart/items/${encodedItemId}`,
    { quantity },
    {
      headers: {
        "X-Cart-Owner-Id": getGuestOwnerId(),
      },
    },
  );

  return data;
}
