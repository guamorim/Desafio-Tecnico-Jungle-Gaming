import { httpClient } from "@/lib/http-client";

import type {
  CartResponse,
  UpdateCartItemInput,
} from "../types";

export async function updateCartItem(
  ownerId: string,
  { itemId, quantity }: UpdateCartItemInput,
): Promise<CartResponse> {
  const encodedItemId = encodeURIComponent(itemId);
  const { data } = await httpClient.patch<CartResponse>(
    `/cart/items/${encodedItemId}`,
    { quantity },
    {
      headers: {
        "X-Cart-Owner-Id": ownerId,
      },
    },
  );

  return data;
}
