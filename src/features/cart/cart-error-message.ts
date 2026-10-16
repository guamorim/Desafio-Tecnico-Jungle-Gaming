import { isAxiosError } from "axios";

export function getCartErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  if (
    isAxiosError<{ message?: string }>(error) &&
    error.response?.data.message
  ) {
    return error.response.data.message;
  }

  return fallbackMessage;
}
