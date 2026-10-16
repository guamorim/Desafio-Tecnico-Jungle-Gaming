export function nftViewerQueryKey(
  viewerId: string | null,
) {
  return [
    "nfts",
    "viewer",
    viewerId ?? "guest",
  ] as const;
}

export function nftListQueryKey(
  viewerId: string | null,
) {
  return [...nftViewerQueryKey(viewerId), "list"] as const;
}

export function nftDetailQueryKey(
  viewerId: string | null,
) {
  return [
    ...nftViewerQueryKey(viewerId),
    "detail",
  ] as const;
}

export function favoriteNftsQueryKey(userId: string) {
  return [
    ...nftViewerQueryKey(userId),
    "favorites",
  ] as const;
}
