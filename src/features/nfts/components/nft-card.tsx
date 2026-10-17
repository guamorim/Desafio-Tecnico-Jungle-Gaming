import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { NftSummary } from "../types";
import { useToggleFavorite } from "../use-toggle-favorite";

type NftCardProps = {
  readonly nft: NftSummary;
};

export function NftCard({ nft }: NftCardProps) {
  const favorite = useToggleFavorite(nft);

  return (
    <div className="relative">
      <Link
        to="/nfts/$nftId"
        params={{ nftId: nft.id }}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <article className="group overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-colors hover:border-primary/60">
          <div className="aspect-square overflow-hidden bg-muted">
            <img
              src={nft.imageUrl}
              alt={`Arte do NFT ${nft.name}`}
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
                {nft.availableQuantity}{" "}
                {nft.availableQuantity === 1
                  ? "disponível"
                  : "disponíveis"}
              </p>
            </div>
          </div>
        </article>
      </Link>

      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={
          nft.isFavorite
            ? `Remover ${nft.name} dos favoritos`
            : `Adicionar ${nft.name} aos favoritos`
        }
        aria-pressed={nft.isFavorite}
        title={
          nft.isFavorite
            ? "Remover dos favoritos"
            : "Adicionar aos favoritos"
        }
        disabled={favorite.isPending}
        className="absolute right-3 top-3 rounded-full bg-background/85 shadow-md backdrop-blur"
        onClick={favorite.toggleFavorite}
      >
        <Heart
          aria-hidden="true"
          className={cn(
            nft.isFavorite &&
              "fill-primary text-primary",
          )}
        />
      </Button>

      {favorite.error && (
        <p
          role="alert"
          className="mt-2 text-xs text-destructive"
        >
          Não foi possível atualizar o favorito.
        </p>
      )}
    </div>
  );
}
