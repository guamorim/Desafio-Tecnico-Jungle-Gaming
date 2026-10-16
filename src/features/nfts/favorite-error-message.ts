import { isAxiosError } from "axios";

export function getFavoriteErrorMessage(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data.message ??
      "Não foi possível atualizar o favorito."
    );
  }

  return "Não foi possível atualizar o favorito.";
}
