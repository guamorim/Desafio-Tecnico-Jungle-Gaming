import { httpClient } from "@/lib/http-client";

import type {
  ConnectWalletInput,
  SaveWalletInput,
  WalletsResponse,
} from "../types";

export async function listWallets(
  signal?: AbortSignal,
): Promise<WalletsResponse> {
  const { data } = await httpClient.get<WalletsResponse>(
    "/wallets",
    { signal },
  );

  return data;
}

export async function connectWallet(
  walletId: string,
  input: ConnectWalletInput,
): Promise<WalletsResponse> {
  const { data } =
    await httpClient.post<WalletsResponse>(
      `/wallets/${encodeURIComponent(walletId)}/connection`,
      input,
    );

  return data;
}

export async function disconnectWallet(
  walletId: string,
): Promise<WalletsResponse> {
  const { data } =
    await httpClient.delete<WalletsResponse>(
      `/wallets/${encodeURIComponent(walletId)}/connection`,
    );

  return data;
}

export async function createWallet(
  input: SaveWalletInput,
): Promise<WalletsResponse> {
  const { data } =
    await httpClient.post<WalletsResponse>(
      "/wallets",
      input,
    );

  return data;
}

export async function updateWallet(
  walletId: string,
  input: SaveWalletInput,
): Promise<WalletsResponse> {
  const { data } =
    await httpClient.patch<WalletsResponse>(
      `/wallets/${encodeURIComponent(walletId)}`,
      input,
    );

  return data;
}
