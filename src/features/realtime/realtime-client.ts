import type { Socket } from "socket.io-client";

import { enableRealtimeMocking } from "@/mocks/enable-mocking";

let realtimeSocketPromise: Promise<Socket> | null = null;

export function getRealtimeSocket() {
  // Engine.IO captures `globalThis.WebSocket` when its module is evaluated.
  // Waiting for the realtime bootstrap guarantees that MSW has installed its
  // interceptor and registered the Socket.IO handlers before the client
  // evaluates and captures the global WebSocket implementation.
  realtimeSocketPromise ??= Promise.all([
    enableRealtimeMocking(),
    import("socket.io-client"),
  ]).then(([, { io }]) =>
      io({
        autoConnect: false,
        path: "/socket.io",
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 250,
        reconnectionDelayMax: 1_000,
      }),
  );

  return realtimeSocketPromise;
}
