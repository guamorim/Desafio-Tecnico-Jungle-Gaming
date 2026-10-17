import { toSocketIo } from "@mswjs/socket.io-binding";
import { delay, http, HttpResponse, ws } from "msw";

import type { Order } from "@/features/checkout/types";
import type {
  NftUpdatedEvent,
  OrderUpdatedEvent,
  RealtimeNftScenarioInput,
} from "@/features/realtime/types";
import { findAuthenticatedUser } from "./auth-handlers";
import {
  getMockDatabase,
  saveMockNfts,
} from "./mock-database";

const realtimeLink = ws.link("*/");
type BoundSocket = ReturnType<typeof toSocketIo>;

type RealtimeConnection = {
  readonly socket: BoundSocket;
  userId: string | null;
};

const connections = new Map<string, RealtimeConnection>();
let unavailableUntil = 0;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRealtimeNftScenarioInput(
  value: unknown,
): value is RealtimeNftScenarioInput {
  if (!isRecord(value)) return false;

  return (
    (value.priceEth === undefined ||
      (typeof value.priceEth === "string" &&
        /^\d+(?:\.\d{1,18})?$/.test(value.priceEth))) &&
    (value.availableQuantity === undefined ||
      (Number.isInteger(value.availableQuantity) &&
        Number(value.availableQuantity) >= 0)) &&
    (value.includeDuplicateAndStale === undefined ||
      typeof value.includeDuplicateAndStale === "boolean")
  );
}

function compareEth(left: string, right: string) {
  const toUnits = (value: string) => {
    const [integer, fraction = ""] = value.split(".");
    return (
      BigInt(integer) * 10n ** 18n +
      BigInt(fraction.padEnd(18, "0"))
    );
  };

  const leftUnits = toUnits(left);
  const rightUnits = toUnits(right);
  return leftUnits < rightUnits ? -1 : leftUnits > rightUnits ? 1 : 0;
}

function emitNftUpdated(event: NftUpdatedEvent) {
  for (const connection of connections.values()) {
    connection.socket.client.emit("nft.updated", event);
  }
}

export function emitOrderUpdated(order: Order) {
  const event = {
    type: "order.updated",
    eventId: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
    userId: order.userId,
    orderId: order.id,
    version: order.version,
    order,
  } satisfies OrderUpdatedEvent;

  for (const connection of connections.values()) {
    if (connection.userId === order.userId) {
      connection.socket.client.emit("order.updated", event);
    }
  }
}

const connectionHandler = realtimeLink.addEventListener(
  "connection",
  (connection) => {
    if (Date.now() < unavailableUntil) {
      queueMicrotask(() => {
        connection.client.close(
          1013,
          "Serviço em tempo real temporariamente indisponível",
        );
      });
      return;
    }

    const socket = toSocketIo(connection);
    const state: RealtimeConnection = {
      socket,
      userId: null,
    };

    connections.set(connection.client.id, state);

    socket.client.on(
      "session.subscribe",
      (_event, payload: unknown) => {
        const token =
          isRecord(payload) && typeof payload.token === "string"
            ? payload.token
            : null;
        const authenticated = token
          ? findAuthenticatedUser(token)
          : null;

        state.userId = authenticated?.user.id ?? null;
      },
    );

    connection.client.addEventListener("close", () => {
      connections.delete(connection.client.id);
    });
  },
);

const updateNftHandler = http.post(
  "/api/mock/realtime/nfts/:nftId/editions/:editionId",
  async ({ params, request }) => {
    await delay(150);

    let input: unknown;
    try {
      input = await request.json();
    } catch {
      input = null;
    }

    if (!isRealtimeNftScenarioInput(input)) {
      return HttpResponse.json(
        { message: "Cenário de tempo real inválido." },
        { status: 400 },
      );
    }

    const nftId = String(params.nftId);
    const editionId = String(params.editionId);
    const database = getMockDatabase();
    const currentNft = database.nfts.find((nft) => nft.id === nftId);
    const currentEdition = currentNft?.editions.find(
      (edition) => edition.id === editionId,
    );

    if (!currentNft || !currentEdition) {
      return HttpResponse.json(
        { message: "Não foi possível encontrar o NFT ou a edição." },
        { status: 404 },
      );
    }

    const nextEdition = {
      ...currentEdition,
      priceEth: input.priceEth ?? currentEdition.priceEth,
      availableQuantity:
        input.availableQuantity ?? currentEdition.availableQuantity,
      version: currentEdition.version + 1,
    };
    const nextEditions = currentNft.editions.map((edition) =>
      edition.id === editionId ? nextEdition : edition,
    );
    const nextNft = {
      ...currentNft,
      editions: nextEditions,
      startingPriceEth: [...nextEditions]
        .sort((left, right) => compareEth(left.priceEth, right.priceEth))[0]
        .priceEth,
      availableQuantity: nextEditions.reduce(
        (total, edition) => total + edition.availableQuantity,
        0,
      ),
      version: currentNft.version + 1,
    };
    const nextNfts = database.nfts.map((nft) =>
      nft.id === nftId ? nextNft : nft,
    );

    saveMockNfts(nextNfts);

    const event = {
      type: "nft.updated",
      eventId: crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
      nftId,
      nftVersion: nextNft.version,
      startingPriceEth: nextNft.startingPriceEth,
      availableQuantity: nextNft.availableQuantity,
      edition: {
        id: nextEdition.id,
        priceEth: nextEdition.priceEth,
        availableQuantity: nextEdition.availableQuantity,
        version: nextEdition.version,
      },
    } satisfies NftUpdatedEvent;

    emitNftUpdated(event);

    if (input.includeDuplicateAndStale) {
      emitNftUpdated(event);
      emitNftUpdated({
        ...event,
        eventId: crypto.randomUUID(),
        nftVersion: Math.max(0, event.nftVersion - 1),
        edition: {
          ...event.edition,
          priceEth: "999",
          availableQuantity: 999,
          version: Math.max(0, event.edition.version - 1),
        },
      });
    }

    return HttpResponse.json(event);
  },
);

const disconnectHandler = http.post(
  "/api/mock/realtime/disconnect",
  async ({ request }) => {
    await delay(100);

    let durationMs = 1_500;
    try {
      const input = (await request.json()) as unknown;
      if (
        isRecord(input) &&
        typeof input.durationMs === "number" &&
        Number.isFinite(input.durationMs)
      ) {
        durationMs = Math.min(
          5_000,
          Math.max(250, Math.round(input.durationMs)),
        );
      }
    } catch {
      // O corpo é opcional no endpoint de controle do mock.
    }

    unavailableUntil = Date.now() + durationMs;

    for (const connection of connections.values()) {
      connection.socket.rawClient.close(
        1012,
        "Interrupção simulada",
      );
    }

    return HttpResponse.json({
      disconnected: true,
      unavailableForMs: durationMs,
    });
  },
);

export const realtimeHandlers = [
  connectionHandler,
  updateNftHandler,
  disconnectHandler,
];
