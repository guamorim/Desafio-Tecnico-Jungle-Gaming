import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/react-query";

import {
  clearAuthToken,
  saveAuthToken,
} from "../auth-token";
import { mergeGuestCart } from "@/features/cart/api/merge-guest-cart";
import { createUserCartOwnerId } from "@/features/cart/cart-owner-id";
import { synchronizeCartCache } from "@/features/cart/cart-cache";
import { getGuestOwnerId } from "@/features/cart/guest-owner";
import { cartQueryKey } from "@/features/cart/queries/cart-query";
import { nftViewerQueryKey } from "@/features/nfts/queries/nft-query-keys";
import { walletsQueryKey } from "@/features/wallets/queries/wallets-query";
import { ordersUserQueryKey } from "@/features/checkout/queries/order-query";
import {
  login,
  logout,
  removeAvatar,
  register,
  updateAvatar,
  updateProfile,
} from "../api/auth-api";
import { sessionQueryKey } from "../queries/session-query";
import type { SessionResponse } from "../types";

function setSession(
  queryClient: QueryClient,
  response: SessionResponse,
) {
  if (response.session) {
    saveAuthToken(response.session.token);
  }

  queryClient.setQueryData(
    sessionQueryKey,
    response,
  );
}

function removeUserCartCache(
  queryClient: QueryClient,
  userId: string,
) {
  queryClient.removeQueries({
    queryKey: cartQueryKey(
      createUserCartOwnerId(userId),
    ),
    exact: true,
  });
}

function removePrivateUserCache(
  queryClient: QueryClient,
  userId: string,
) {
  removeUserCartCache(queryClient, userId);
  queryClient.removeQueries({
    queryKey: nftViewerQueryKey(userId),
  });
  queryClient.removeQueries({
    queryKey: walletsQueryKey(userId),
    exact: true,
  });
  queryClient.removeQueries({
    queryKey: ordersUserQueryKey(userId),
  });
}

async function synchronizeAuthentication(
  queryClient: QueryClient,
  response: SessionResponse,
) {
  const nextSession = response.session;

  if (!nextSession) {
    setSession(queryClient, response);
    return;
  }

  const previousSession =
    queryClient.getQueryData<SessionResponse>(
      sessionQueryKey,
    )?.session;
  const guestOwnerId = getGuestOwnerId();

  saveAuthToken(nextSession.token);

  try {
    const mergedCart = await mergeGuestCart(
      guestOwnerId,
    );

    if (
      previousSession &&
      previousSession.user.id !==
        nextSession.user.id
    ) {
      removePrivateUserCache(
        queryClient,
        previousSession.user.id,
      );
    }

    queryClient.removeQueries({
      queryKey: cartQueryKey(guestOwnerId),
      exact: true,
    });
    synchronizeCartCache(queryClient, mergedCart);
    queryClient.setQueryData(
      sessionQueryKey,
      response,
    );
  } catch (error) {
    clearAuthToken();
    throw error;
  }
}

export function loginMutationOptions(
  queryClient: QueryClient,
) {
  return mutationOptions({
    mutationFn: login,
    onSuccess: (response) =>
      synchronizeAuthentication(queryClient, response),
  });
}

export function registerMutationOptions(
  queryClient: QueryClient,
) {
  return mutationOptions({
    mutationFn: register,
    onSuccess: (response) =>
      synchronizeAuthentication(queryClient, response),
  });
}

export function updateProfileMutationOptions(
  queryClient: QueryClient,
) {
  return mutationOptions({
    mutationFn: updateProfile,
    onSuccess: (response) => {
      setSession(queryClient, response);
    },
  });
}

export function updateAvatarMutationOptions(
  queryClient: QueryClient,
) {
  return mutationOptions({
    mutationFn: updateAvatar,
    onSuccess: (response) => {
      setSession(queryClient, response);
    },
  });
}

export function removeAvatarMutationOptions(
  queryClient: QueryClient,
) {
  return mutationOptions({
    mutationFn: removeAvatar,
    onSuccess: (response) => {
      setSession(queryClient, response);
    },
  });
}

export function logoutMutationOptions(
  queryClient: QueryClient,
) {
  return mutationOptions({
    mutationFn: logout,
    onSettled: () => {
      const currentSession =
        queryClient.getQueryData<SessionResponse>(
          sessionQueryKey,
        )?.session;

      if (currentSession) {
        removePrivateUserCache(
          queryClient,
          currentSession.user.id,
        );
      }

      clearAuthToken();

      queryClient.setQueryData(
        sessionQueryKey,
        { session: null } satisfies SessionResponse,
      );
    },
  });
}
