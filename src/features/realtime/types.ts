import type { Order } from "@/features/checkout/types";

type RealtimeEventBase = {
  readonly eventId: string;
  readonly occurredAt: string;
};

export type NftUpdatedEvent = RealtimeEventBase & {
  readonly type: "nft.updated";
  readonly nftId: string;
  readonly nftVersion: number;
  readonly startingPriceEth: string;
  readonly availableQuantity: number;
  readonly edition: {
    readonly id: string;
    readonly priceEth: string;
    readonly availableQuantity: number;
    readonly version: number;
  };
};

export type OrderUpdatedEvent = RealtimeEventBase & {
  readonly type: "order.updated";
  readonly userId: string;
  readonly orderId: string;
  readonly version: number;
  readonly order: Order;
};

export type RealtimeConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected";

export type RealtimeNftScenarioInput = {
  readonly priceEth?: string;
  readonly availableQuantity?: number;
  readonly includeDuplicateAndStale?: boolean;
};
