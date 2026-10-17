import { createContext } from "react";

import type {
  NftUpdatedEvent,
  RealtimeConnectionStatus,
} from "./types";

export type RealtimeContextValue = {
  readonly connectionStatus: RealtimeConnectionStatus;
  readonly lastNftUpdate: NftUpdatedEvent | null;
};

export const RealtimeContext =
  createContext<RealtimeContextValue | null>(null);
