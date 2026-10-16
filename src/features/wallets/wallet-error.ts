import { isAxiosError } from "axios";

import type { WalletErrorResponse } from "./types";

export function getWalletErrorResponse(error: unknown) {
  if (isAxiosError<WalletErrorResponse>(error)) {
    return error.response?.data;
  }

  return undefined;
}
