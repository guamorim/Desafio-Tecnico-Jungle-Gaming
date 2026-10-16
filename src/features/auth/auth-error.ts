import axios from "axios";

import type { AuthErrorResponse } from "./types";

export function getAuthErrorResponse(
  error: unknown,
) {
  if (
    axios.isAxiosError<AuthErrorResponse>(error)
  ) {
    return error.response?.data;
  }

  return undefined;
}
