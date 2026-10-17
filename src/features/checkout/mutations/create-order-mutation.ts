import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/react-query";

import { createOrder } from "../api/orders-api";
import { orderQueryKey } from "../queries/order-query";
import type { CreateOrderInput } from "../types";

type CreateOrderVariables = {
  readonly idempotencyKey: string;
  readonly input: CreateOrderInput;
};

export function createOrderMutationOptions(
  queryClient: QueryClient,
  userId: string,
) {
  return mutationOptions({
    mutationFn: ({
      idempotencyKey,
      input,
    }: CreateOrderVariables) =>
      createOrder(input, idempotencyKey),
    onSuccess: (order) => {
      queryClient.setQueryData(
        orderQueryKey(userId, order.id),
        order,
      );
    },
  });
}
