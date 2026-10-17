import {
  lazy,
  Suspense,
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
import { ordersUserQueryKey } from "@/features/checkout/queries/order-query";
import { RealtimeProvider } from "@/features/realtime/realtime-provider";
import { walletsQueryKey } from "@/features/wallets/queries/wallets-query";
import type { AuthMode } from "./components/auth-dialog";
import {
  sessionQueryKey,
  sessionQueryOptions,
} from "./queries/session-query";

const AuthDialog = lazy(() =>
  import("./components/auth-dialog").then(
    ({ AuthDialog: Dialog }) => ({ default: Dialog }),
  ),
);

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
  const authTrigger = useRef<HTMLElement | null>(null);

  function openAuth(mode: AuthMode) {
    authTrigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setAuthMode(mode);
  }

  function handleAuthOpenChange(open: boolean) {
    if (open) {
      return;
    }

    const trigger = authTrigger.current;
    authTrigger.current = null;
    setAuthMode(null);

    requestAnimationFrame(() => {
      if (trigger?.isConnected) {
        trigger.focus();
      }
    });
  }

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
      queryClient.removeQueries({
        queryKey: walletsQueryKey(
          previousUserId.current,
        ),
        exact: true,
      });
      queryClient.removeQueries({
        queryKey: ordersUserQueryKey(previousUserId.current),
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
          openAuth("login");
        },
        openRegister: () => {
          openAuth("register");
        },
      }}
    >
      <RealtimeProvider session={data?.session ?? null}>
        {children}

        {authMode !== null && (
          <Suspense fallback={null}>
            <AuthDialog
              mode={authMode}
              open
              onModeChange={setAuthMode}
              onOpenChange={handleAuthOpenChange}
            />
          </Suspense>
        )}
      </RealtimeProvider>
    </AuthContext.Provider>
  );
}
