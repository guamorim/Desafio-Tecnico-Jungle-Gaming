import {
  useState,
  type PropsWithChildren,
} from "react";
import { useQuery } from "@tanstack/react-query";

import { AuthContext } from "./auth-context";
import {
  AuthDialog,
  type AuthMode,
} from "./components/auth-dialog";
import { sessionQueryOptions } from "./queries/session-query";

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const { data, isPending } = useQuery(
    sessionQueryOptions(),
  );
  const [authMode, setAuthMode] =
    useState<AuthMode | null>(null);

  return (
    <AuthContext.Provider
      value={{
        session: data?.session ?? null,
        isSessionPending: isPending,
        openLogin: () => {
          setAuthMode("login");
        },
        openRegister: () => {
          setAuthMode("register");
        },
      }}
    >
      {children}

      <AuthDialog
        mode={authMode ?? "login"}
        open={authMode !== null}
        onModeChange={setAuthMode}
        onOpenChange={(open) => {
          if (!open) {
            setAuthMode(null);
          }
        }}
      />
    </AuthContext.Provider>
  );
}
