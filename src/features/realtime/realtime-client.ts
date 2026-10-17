import type { Socket } from "socket.io-client";

let realtimeSocketPromise: Promise<Socket> | null = null;

export function getRealtimeSocket() {
  // Engine.IO captures `globalThis.WebSocket` when its module is evaluated.
  // Loading it lazily guarantees that MSW has installed its interceptor first.
  realtimeSocketPromise ??= import("socket.io-client").then(
    ({ io }) =>
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
