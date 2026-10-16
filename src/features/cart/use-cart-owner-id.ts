import { useState } from "react";

import { useAuth } from "@/features/auth/use-auth";

import { createUserCartOwnerId } from "./cart-owner-id";
import { getGuestOwnerId } from "./guest-owner";

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
