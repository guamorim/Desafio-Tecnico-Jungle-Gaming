import { useContext } from "react";

import { RealtimeContext } from "./realtime-context";

export function useRealtime() {
  const context = useContext(RealtimeContext);

  if (!context) {
    throw new Error(
      "useRealtime deve ser usado dentro de RealtimeProvider.",
    );
  }

  return context;
}
