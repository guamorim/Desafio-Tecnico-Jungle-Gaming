import {
  mutationOptions,
  type QueryClient,
} from "@tanstack/react-query";

import {
  addFavoriteNft,
  removeFavoriteNft,
} from "../api/favorites-api";
import type {
  FavoriteNftsResponse,
  ListNftsResponse,
  NftDetail,
  NftSummary,
} from "../types";
import {
  favoriteNftsQueryKey,
  nftDetailQueryKey,
  nftListQueryKey,
  nftViewerQueryKey,
} from "../queries/nft-query-keys";

export type ToggleFavoriteInput = {
  readonly nft: NftSummary;
};

function updateSummary(
  nft: NftSummary,
  nftId: string,
  isFavorite: boolean,
) {
  return nft.id === nftId
    ? { ...nft, isFavorite }
    : nft;
}

function updateFavoriteCaches(
  queryClient: QueryClient,
  userId: string,
  nft: NftSummary,
  isFavorite: boolean,
) {
  queryClient.setQueriesData<ListNftsResponse>(
    { queryKey: nftListQueryKey(userId) },
    (current) =>
      current
        ? {
            ...current,
            items: current.items.map((item) =>
              updateSummary(
                item,
                nft.id,
                isFavorite,
              ),
            ),
          }
        : current,
  );

  queryClient.setQueriesData<NftDetail>(
    { queryKey: nftDetailQueryKey(userId) },
    (current) =>
      current
        ? {
            ...current,
            isFavorite:
              current.id === nft.id
                ? isFavorite
                : current.isFavorite,
            relatedNfts: current.relatedNfts.map(
              (relatedNft) =>
                updateSummary(
                  relatedNft,
                  nft.id,
                  isFavorite,
                ),
            ),
          }
        : current,
  );

  queryClient.setQueryData<FavoriteNftsResponse>(
    favoriteNftsQueryKey(userId),
    (current) => {
      if (!current) {
        return isFavorite ? { items: [nft] } : current;
      }

      if (!isFavorite) {
        return {
          items: current.items.filter(
            (item) => item.id !== nft.id,
          ),
        };
      }

      const favoriteNft = {
        ...nft,
        isFavorite: true,
      };
      const alreadyExists = current.items.some(
        (item) => item.id === nft.id,
      );

      return {
        items: alreadyExists
          ? current.items.map((item) =>
              updateSummary(item, nft.id, true),
            )
          : [...current.items, favoriteNft],
      };
    },
  );
}

export function toggleFavoriteMutationOptions(
  queryClient: QueryClient,
  userId: string,
) {
  return mutationOptions({
    mutationKey: ["favorites", "toggle", userId],
    mutationFn: ({ nft }: ToggleFavoriteInput) =>
      nft.isFavorite
        ? removeFavoriteNft(nft.id)
        : addFavoriteNft(nft.id),
    onMutate: async ({ nft }) => {
      const viewerKey = nftViewerQueryKey(userId);

      await queryClient.cancelQueries({
        queryKey: viewerKey,
      });

      const snapshots =
        queryClient.getQueriesData<unknown>({
          queryKey: viewerKey,
        });

      updateFavoriteCaches(
        queryClient,
        userId,
        nft,
        !nft.isFavorite,
      );

      return { snapshots };
    },
    onSuccess: (updatedNft) => {
      updateFavoriteCaches(
        queryClient,
        userId,
        updatedNft,
        updatedNft.isFavorite,
      );
    },
    onError: (_error, _input, context) => {
      for (const [queryKey, data] of
        context?.snapshots ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: nftViewerQueryKey(userId),
      }),
  });
}
