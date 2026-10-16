import { httpClient } from "@/lib/http-client";

import type { CartResponse } from "../types";

export async function getCart(
  ownerId: string,
): Promise<CartResponse> {
  const { data } = await httpClient.get<CartResponse>(
    "/cart",
    {
      headers: {
        "X-Cart-Owner-Id": ownerId,
      },
    },
  );

  return data;
}
