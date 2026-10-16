import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/react-query";

import {
  clearAuthToken,
  saveAuthToken,
} from "../auth-token";
import {
  login,
  logout,
  register,
  updateProfile,
} from "../api/auth-api";
import { sessionQueryKey } from "../queries/session-query";
import type { SessionResponse } from "../types";

function synchronizeSession(
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

export function loginMutationOptions(
  queryClient: QueryClient,
) {
  return mutationOptions({
    mutationFn: login,
    onSuccess: (response) => {
      synchronizeSession(queryClient, response);
    },
  });
}

export function registerMutationOptions(
  queryClient: QueryClient,
) {
  return mutationOptions({
    mutationFn: register,
    onSuccess: (response) => {
      synchronizeSession(queryClient, response);
    },
  });
}

export function updateProfileMutationOptions(
  queryClient: QueryClient,
) {
  return mutationOptions({
    mutationFn: updateProfile,
    onSuccess: (response) => {
      synchronizeSession(queryClient, response);
    },
  });
}

export function logoutMutationOptions(
  queryClient: QueryClient,
) {
  return mutationOptions({
    mutationFn: logout,
    onSettled: () => {
      clearAuthToken();

      queryClient.setQueryData(
        sessionQueryKey,
        { session: null } satisfies SessionResponse,
      );
    },
  });
}
