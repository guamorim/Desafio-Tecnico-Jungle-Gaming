let mockingStartPromise: Promise<void> | undefined;
let mockingRestorePromise: Promise<void> | undefined;
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
  const [
    { isCommonAssetRequest },
    { HttpNetworkFrame },
    { worker },
  ] = await Promise.all([
    import("msw"),
    import("msw/experimental"),
    import("./browser"),
  ]);

  await worker.start({
    onUnhandledFrame({ frame, defaults }) {
      if (
        frame instanceof HttpNetworkFrame &&
        (frame.data.request.mode === "navigate" ||
          isCommonAssetRequest(frame.data.request))
      ) {
        return;
      }

      defaults.warn();
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
