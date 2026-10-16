import { Link } from "@tanstack/react-router";

import type { NftSummary } from "../types";

type NftCardProps = {
  readonly nft: NftSummary;
};

export function NftCard({ nft }: NftCardProps) {
  return (
    <Link
      to="/nfts/$nftId"
      params={{ nftId: nft.id }}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <article className="group overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-colors hover:border-primary/60">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={nft.imageUrl}
            alt={`Artwork for ${nft.name}`}
            width={640}
            height={640}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="space-y-4 p-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {nft.collectionName}
            </p>

            <h2 className="text-lg font-semibold tracking-tight">
              {nft.name}
            </h2>

            <p className="text-sm text-muted-foreground">
              Criado por {nft.creatorName}
            </p>
          </div>

          <div className="flex items-end justify-between gap-4 border-t pt-4">
            <div>
              <p className="text-xs text-muted-foreground">
                Preço inicial
              </p>

              <p className="font-semibold">
                {nft.startingPriceEth} ETH
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              {nft.availableQuantity} disponíveis
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
