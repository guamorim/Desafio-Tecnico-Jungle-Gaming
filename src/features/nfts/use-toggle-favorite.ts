import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "@/features/auth/use-auth";

import { toggleFavoriteMutationOptions } from "./mutations/toggle-favorite-mutation";
import type { NftSummary } from "./types";

export function useToggleFavorite(nft: NftSummary) {
  const queryClient = useQueryClient();
  const {
    session,
    isSessionPending,
    openLogin,
  } = useAuth();
  const mutation = useMutation(
    toggleFavoriteMutationOptions(
      queryClient,
      session?.user.id ?? "anonymous",
    ),
  );

  function toggleFavorite() {
    mutation.reset();

    if (isSessionPending) {
      return;
    }

    if (!session) {
      openLogin();
      return;
    }

    mutation.mutate({ nft });
  }

  return {
    error: mutation.error,
    isPending:
      isSessionPending || mutation.isPending,
    toggleFavorite,
  };
}
