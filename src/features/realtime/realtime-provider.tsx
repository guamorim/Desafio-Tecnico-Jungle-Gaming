import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import {
  useQueryClient,
  type Query,
} from "@tanstack/react-query";

import type { AuthSession } from "@/features/auth/types";
import type { Order } from "@/features/checkout/types";
import { orderQueryKey } from "@/features/checkout/queries/order-query";
import type {
  FavoriteNftsResponse,
  ListNftsResponse,
  NftDetail,
  NftSummary,
} from "@/features/nfts/types";
import { nftViewerQueryKey } from "@/features/nfts/queries/nft-query-keys";

import { getRealtimeSocket } from "./realtime-client";
import { RealtimeContext } from "./realtime-context";
import type {
  NftUpdatedEvent,
  OrderUpdatedEvent,
  RealtimeConnectionStatus,
} from "./types";

type RealtimeProviderProps = PropsWithChildren<{
  readonly session: AuthSession | null;
}>;

let pendingDisconnectTimer: ReturnType<
  typeof setTimeout
> | null = null;

function isNftUpdatedEvent(value: unknown): value is NftUpdatedEvent {
  if (typeof value !== "object" || value === null) return false;

  const event = value as Record<string, unknown>;
  const edition = event.edition;

  return (
    event.type === "nft.updated" &&
    typeof event.eventId === "string" &&
    typeof event.nftId === "string" &&
    typeof event.nftVersion === "number" &&
    typeof event.startingPriceEth === "string" &&
    typeof event.availableQuantity === "number" &&
    typeof edition === "object" &&
    edition !== null &&
    typeof (edition as Record<string, unknown>).id === "string" &&
    typeof (edition as Record<string, unknown>).priceEth === "string" &&
    typeof (edition as Record<string, unknown>).availableQuantity === "number" &&
    typeof (edition as Record<string, unknown>).version === "number"
  );
}

function isOrderUpdatedEvent(value: unknown): value is OrderUpdatedEvent {
  if (typeof value !== "object" || value === null) return false;

  const event = value as Record<string, unknown>;
  const order = event.order;

  return (
    event.type === "order.updated" &&
    typeof event.eventId === "string" &&
    typeof event.userId === "string" &&
    typeof event.orderId === "string" &&
    typeof event.version === "number" &&
    typeof order === "object" &&
    order !== null &&
    (order as Record<string, unknown>).id === event.orderId
  );
}

function updateNftSummary(
  nft: NftSummary,
  event: NftUpdatedEvent,
) {
  if (nft.id !== event.nftId || nft.version >= event.nftVersion) {
    return nft;
  }

  return {
    ...nft,
    startingPriceEth: event.startingPriceEth,
    availableQuantity: event.availableQuantity,
    version: event.nftVersion,
  };
}

function isNftDetail(value: unknown): value is NftDetail {
  return (
    typeof value === "object" &&
    value !== null &&
    "editions" in value &&
    Array.isArray(value.editions)
  );
}

function isNftCollection(
  value: unknown,
): value is ListNftsResponse | FavoriteNftsResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "items" in value &&
    Array.isArray(value.items)
  );
}

function isRealtimeResourceQuery(query: Query) {
  const root = query.queryKey[0];
  return root === "nfts" || root === "cart" || root === "orders";
}

export function RealtimeProvider({
  children,
  session,
}: RealtimeProviderProps) {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] =
    useState<RealtimeConnectionStatus>("connecting");
  const [lastNftUpdate, setLastNftUpdate] =
    useState<NftUpdatedEvent | null>(null);
  const latestVersions = useRef(new Map<string, number>());
  const currentUserId = session?.user.id ?? null;
  const currentToken = session?.token ?? null;

  useEffect(() => {
    if (pendingDisconnectTimer !== null) {
      clearTimeout(pendingDisconnectTimer);
      pendingDisconnectTimer = null;
    }

    let isActive = true;
    let activeSocket: Awaited<
      ReturnType<typeof getRealtimeSocket>
    > | null = null;
    let reconnectTimer: ReturnType<
      typeof setTimeout
    > | null = null;

    function clearReconnectTimer() {
      if (reconnectTimer === null) return;
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    function scheduleReconnect() {
      if (!isActive || reconnectTimer !== null) return;

      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        if (
          !isActive ||
          !activeSocket ||
          activeSocket.connected
        ) {
          return;
        }

        activeSocket.disconnect();
        activeSocket.connect();
        scheduleReconnect();
      }, 500);
    }

    function reconcileActiveResources() {
      void queryClient.refetchQueries({
        type: "active",
        predicate: isRealtimeResourceQuery,
      });
    }

    function handleConnect() {
      clearReconnectTimer();
      setConnectionStatus("connected");
      activeSocket?.emit("session.subscribe", {
        token: currentToken,
      });
      reconcileActiveResources();
    }

    function handleDisconnect() {
      setConnectionStatus("disconnected");
      scheduleReconnect();
    }

    function handleConnectError() {
      setConnectionStatus("disconnected");
      scheduleReconnect();
    }

    function handleNftUpdated(value: unknown) {
      if (!isNftUpdatedEvent(value)) return;

      const resourceKey = `${value.nftId}:${value.edition.id}`;
      const latestVersion = latestVersions.current.get(resourceKey) ?? 0;

      if (value.edition.version <= latestVersion) return;
      latestVersions.current.set(resourceKey, value.edition.version);

      queryClient.setQueriesData(
        { queryKey: ["nfts"] },
        (current: unknown) => {
          if (isNftDetail(current)) {
            if (
              current.id !== value.nftId ||
              current.version >= value.nftVersion
            ) {
              return current;
            }

            return {
              ...current,
              startingPriceEth: value.startingPriceEth,
              availableQuantity: value.availableQuantity,
              version: value.nftVersion,
              editions: current.editions.map((edition) =>
                edition.id === value.edition.id &&
                edition.version < value.edition.version
                  ? { ...edition, ...value.edition }
                  : edition,
              ),
              relatedNfts: current.relatedNfts.map((nft) =>
                updateNftSummary(nft, value),
              ),
            } satisfies NftDetail;
          }

          if (isNftCollection(current)) {
            return {
              ...current,
              items: current.items.map((nft) =>
                updateNftSummary(nft, value),
              ),
            };
          }

          return current;
        },
      );

      setLastNftUpdate(value);
      void queryClient.invalidateQueries({
        queryKey: ["cart"],
        refetchType: "active",
      });
    }

    function handleOrderUpdated(value: unknown) {
      if (
        !isOrderUpdatedEvent(value) ||
        value.userId !== currentUserId
      ) {
        return;
      }

      queryClient.setQueryData<Order>(
        orderQueryKey(value.userId, value.orderId),
        (current) => {
          if (!current || current.version < value.version) {
            return value.order;
          }
          return current;
        },
      );

      if (value.order.status === "confirmed") {
        void queryClient.invalidateQueries({
          queryKey: ["cart"],
          refetchType: "active",
        });
        void queryClient.invalidateQueries({
          queryKey: nftViewerQueryKey(value.userId),
        });
      }
    }

    void getRealtimeSocket().then((socket) => {
      if (!isActive) return;

      activeSocket = socket;
      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      socket.on("connect_error", handleConnectError);
      socket.on("nft.updated", handleNftUpdated);
      socket.on("order.updated", handleOrderUpdated);

      if (socket.connected) {
        handleConnect();
      } else {
        socket.connect();
      }
    });

    return () => {
      isActive = false;
      clearReconnectTimer();
      if (!activeSocket) return;

      activeSocket.off("connect", handleConnect);
      activeSocket.off("disconnect", handleDisconnect);
      activeSocket.off("connect_error", handleConnectError);
      activeSocket.off("nft.updated", handleNftUpdated);
      activeSocket.off("order.updated", handleOrderUpdated);
      const socketToDisconnect = activeSocket;
      pendingDisconnectTimer = setTimeout(() => {
        socketToDisconnect.disconnect();
        pendingDisconnectTimer = null;
      }, 0);
    };
  }, [currentToken, currentUserId, queryClient]);

  const contextValue = useMemo(
    () => ({ connectionStatus, lastNftUpdate }),
    [connectionStatus, lastNftUpdate],
  );

  return (
    <RealtimeContext.Provider value={contextValue}>
      <span
        data-testid="realtime-connection-status"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {connectionStatus === "connected"
          ? "Conexão em tempo real ativa"
          : connectionStatus === "connecting"
            ? "Conectando ao serviço em tempo real"
            : "Conexão em tempo real interrompida"}
      </span>
      {children}
    </RealtimeContext.Provider>
  );
}
