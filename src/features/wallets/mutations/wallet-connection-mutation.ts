import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/react-query";

import {
  connectWallet,
  disconnectWallet,
} from "../api/wallets-api";
import { walletsQueryKey } from "../queries/wallets-query";
import type { ConnectWalletInput } from "../types";

type ConnectWalletVariables = {
  readonly input: ConnectWalletInput;
  readonly walletId: string;
};

export function connectWalletMutationOptions(
  queryClient: QueryClient,
  userId: string,
) {
  return mutationOptions({
    mutationFn: ({
      input,
      walletId,
    }: ConnectWalletVariables) =>
      connectWallet(walletId, input),
    onSuccess: (response) => {
      queryClient.setQueryData(
        walletsQueryKey(userId),
        response,
      );
    },
  });
}

export function disconnectWalletMutationOptions(
  queryClient: QueryClient,
  userId: string,
) {
  return mutationOptions({
    mutationFn: disconnectWallet,
    onSuccess: (response) => {
      queryClient.setQueryData(
        walletsQueryKey(userId),
        response,
      );
    },
  });
}
