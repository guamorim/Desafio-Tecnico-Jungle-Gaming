import { isCommonAssetRequest } from "msw";

import { worker } from "./browser";

let mockingStartPromise: Promise<void> | undefined;
let mockingRestorePromise: Promise<void> | undefined;
let realtimeMockingPromise: Promise<void> | undefined;
let lastMockingActivationAt = 0;

const mockingActivationFreshTime = 10_000;

function isMockingEnabledMessage(value: unknown) {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "MOCKING_ENABLED"
  );
}

async function startMocking() {
  await worker.start({
    onUnhandledRequest(request, print) {
      if (
        request.mode === "navigate" ||
        isCommonAssetRequest(request)
      ) {
        return;
      }

      print.warning();
    },
  });

  lastMockingActivationAt = Date.now();
}

export function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MOCKS === "false") {
    return Promise.resolve();
  }

  mockingStartPromise ??= startMocking().catch(
    (error: unknown) => {
      mockingStartPromise = undefined;
      throw error;
    },
  );

  return mockingStartPromise;
}

export function enableRealtimeMocking() {
  if (import.meta.env.VITE_ENABLE_MOCKS === "false") {
    return Promise.resolve();
  }

  realtimeMockingPromise ??= Promise.all([
    enableMocking(),
    import("./realtime-handlers"),
  ])
    .then(([, { realtimeHandlers }]) => {
      worker.use(...realtimeHandlers);
    })
    .catch((error: unknown) => {
      realtimeMockingPromise = undefined;
      throw error;
    });

  return realtimeMockingPromise;
}

async function activateMockingClient() {
  const controller = navigator.serviceWorker?.controller;

  if (!controller) {
    return;
  }

  const wasActivated = await new Promise<boolean>((resolve) => {
    let timeoutId = 0;

    function finish(confirmed: boolean) {
      window.clearTimeout(timeoutId);
      navigator.serviceWorker.removeEventListener(
        "message",
        handleMessage,
      );
      resolve(confirmed);
    }

    function handleMessage(event: MessageEvent<unknown>) {
      if (isMockingEnabledMessage(event.data)) {
        finish(true);
      }
    }

    navigator.serviceWorker.addEventListener(
      "message",
      handleMessage,
    );

    timeoutId = window.setTimeout(
      () => finish(false),
      1_000,
    );
    controller.postMessage("MOCK_ACTIVATE");
  });

  if (wasActivated) {
    lastMockingActivationAt = Date.now();
  }
}

export async function restoreMocking() {
  if (import.meta.env.VITE_ENABLE_MOCKS === "false") {
    return;
  }

  await enableMocking();

  if (
    Date.now() - lastMockingActivationAt <
    mockingActivationFreshTime
  ) {
    return;
  }

  mockingRestorePromise ??=
    activateMockingClient().finally(() => {
      mockingRestorePromise = undefined;
    });

  await mockingRestorePromise;
}
