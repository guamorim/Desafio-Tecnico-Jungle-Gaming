import axios from "axios";

import type { OrderErrorResponse } from "./types";

export function getOrderErrorResponse(
  error: unknown,
) {
  if (!axios.isAxiosError<OrderErrorResponse>(error)) {
    return undefined;
  }

  return error.response?.data;
}
