import { httpClient } from "@/lib/http-client";

import { getGuestOwnerId } from "../guest-owner";
import type { CartResponse } from "../types";

export async function clearCart(): Promise<CartResponse> {
  const { data } = await httpClient.delete<CartResponse>(
    "/cart/items",
    {
      headers: {
        "X-Cart-Owner-Id": getGuestOwnerId(),
      },
    },
  );

  return data;
}
