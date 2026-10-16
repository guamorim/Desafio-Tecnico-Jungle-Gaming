import { useState } from "react";

import { useAuth } from "@/features/auth/use-auth";

import { getGuestOwnerId } from "./guest-owner";

export function createUserCartOwnerId(userId: string) {
  return `user-${userId}`;
}

export function useCartOwnerId() {
  const { session, isSessionPending } = useAuth();
  const [guestOwnerId] = useState(getGuestOwnerId);

  if (isSessionPending) {
    return null;
  }

  return session
    ? createUserCartOwnerId(session.user.id)
    : guestOwnerId;
}
