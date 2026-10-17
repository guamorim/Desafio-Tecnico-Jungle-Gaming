import { httpClient } from "@/lib/http-client";

import type {
  CreateOrderInput,
  Order,
} from "../types";

export async function createOrder(
  input: CreateOrderInput,
  idempotencyKey: string,
): Promise<Order> {
  const { data } = await httpClient.post<Order>(
    "/orders",
    input,
    {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    },
  );

  return data;
}

export async function getOrder(
  orderId: string,
  signal?: AbortSignal,
): Promise<Order> {
  const { data } = await httpClient.get<Order>(
    `/orders/${encodeURIComponent(orderId)}`,
    { signal },
  );

  return data;
}
