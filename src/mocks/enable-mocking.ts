export async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MOCKS === "false") {
    return;
  }

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
}
