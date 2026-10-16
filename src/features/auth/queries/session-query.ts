import { queryOptions } from "@tanstack/react-query";

import { getAuthSession } from "../api/auth-api";

export const sessionQueryKey =
  ["auth", "session"] as const;

export function sessionQueryOptions() {
  return queryOptions({
    queryKey: sessionQueryKey,
    queryFn: getAuthSession,
    staleTime: 60_000,
    retry: false,
  });
}
