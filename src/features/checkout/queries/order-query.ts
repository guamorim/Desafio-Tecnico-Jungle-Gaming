import { queryOptions } from "@tanstack/react-query";

import { getOrder } from "../api/orders-api";

export function orderQueryKey(
  userId: string,
  orderId: string,
) {
  return ["orders", userId, orderId] as const;
}

export function ordersUserQueryKey(userId: string) {
  return ["orders", userId] as const;
}

export function orderQueryOptions(
  userId: string,
  orderId: string,
  useRestPolling = true,
) {
  return queryOptions({
    queryKey: orderQueryKey(userId, orderId),
    queryFn: ({ signal }) =>
      getOrder(orderId, signal),
    refetchInterval: (query) =>
      useRestPolling &&
      query.state.data?.status === "pending"
        ? 750
        : false,
    staleTime: 0,
  });
}
