import { httpClient } from "@/lib/http-client";

import { getGuestOwnerId } from "../guest-owner";
import type {
  AddCartItemInput,
  CartResponse,
} from "../types";

export async function addCartItem(
  input: AddCartItemInput,
): Promise<CartResponse> {
  const { data } = await httpClient.post<CartResponse>(
    "/cart/items",
    input,
    {
      headers: {
        "X-Cart-Owner-Id": getGuestOwnerId(),
      },
    },
  );

  return data;
}
