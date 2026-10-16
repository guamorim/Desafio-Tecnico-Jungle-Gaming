import { httpClient } from "@/lib/http-client";

import type {
  AddCartItemInput,
  CartResponse,
} from "../types";

export async function addCartItem(
  ownerId: string,
  input: AddCartItemInput,
): Promise<CartResponse> {
  const { data } = await httpClient.post<CartResponse>(
    "/cart/items",
    input,
    {
      headers: {
        "X-Cart-Owner-Id": ownerId,
      },
    },
  );

  return data;
}
