import { createContext } from "react";

import type { AuthSession } from "./types";

export type AuthContextValue = {
  readonly session: AuthSession | null;
  readonly isSessionPending: boolean;
  readonly openLogin: () => void;
  readonly openRegister: () => void;
};

export const AuthContext =
  createContext<AuthContextValue | null>(null);
