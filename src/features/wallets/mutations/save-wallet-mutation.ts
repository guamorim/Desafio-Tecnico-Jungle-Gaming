import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/react-query";

import {
  createWallet,
  updateWallet,
} from "../api/wallets-api";
import { walletsQueryKey } from "../queries/wallets-query";
import type { SaveWalletInput } from "../types";

type SaveWalletVariables = {
  readonly input: SaveWalletInput;
  readonly walletId?: string;
};

export function saveWalletMutationOptions(
  queryClient: QueryClient,
  userId: string,
) {
  return mutationOptions({
    mutationFn: ({
      input,
      walletId,
    }: SaveWalletVariables) =>
      walletId
        ? updateWallet(walletId, input)
        : createWallet(input),
    onSuccess: (response) => {
      queryClient.setQueryData(
        walletsQueryKey(userId),
        response,
      );
    },
  });
}
