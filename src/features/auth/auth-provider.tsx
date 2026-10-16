import {
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { AuthContext } from "./auth-context";
import { createUserCartOwnerId } from "@/features/cart/cart-owner-id";
import { cartQueryKey } from "@/features/cart/queries/cart-query";
import { nftViewerQueryKey } from "@/features/nfts/queries/nft-query-keys";
import {
  AuthDialog,
  type AuthMode,
} from "./components/auth-dialog";
import {
  sessionQueryKey,
  sessionQueryOptions,
} from "./queries/session-query";

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery(
    sessionQueryOptions(),
  );
  const [authMode, setAuthMode] =
    useState<AuthMode | null>(null);
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    if (isPending) {
      return;
    }

    const currentUserId =
      data?.session?.user.id ?? null;

    if (
      previousUserId.current &&
      previousUserId.current !== currentUserId
    ) {
      queryClient.removeQueries({
        queryKey: cartQueryKey(
          createUserCartOwnerId(
            previousUserId.current,
          ),
        ),
        exact: true,
      });
      queryClient.removeQueries({
        queryKey: nftViewerQueryKey(
          previousUserId.current,
        ),
      });
    }

    previousUserId.current = currentUserId;
  }, [data?.session?.user.id, isPending, queryClient]);

  useEffect(() => {
    const session = data?.session;

    if (!session) {
      return;
    }

    const expiresIn =
      Date.parse(session.expiresAt) - Date.now();

    const synchronizeExpiration = () => {
      void queryClient.refetchQueries({
        queryKey: sessionQueryKey,
        type: "active",
      });
    };

    if (expiresIn <= 0) {
      synchronizeExpiration();
      return;
    }

    const timeoutId = window.setTimeout(
      synchronizeExpiration,
      expiresIn + 50,
    );

    return () => window.clearTimeout(timeoutId);
  }, [data?.session, queryClient]);

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
