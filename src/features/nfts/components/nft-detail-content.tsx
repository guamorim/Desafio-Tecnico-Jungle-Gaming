import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Heart,
  Share2,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getFavoriteErrorMessage } from "../favorite-error-message";
import type { NftDetail } from "../types";
import { useToggleFavorite } from "../use-toggle-favorite";
import { NftDetailTabs } from "./nft-detail-tabs";
import { NftEditionPurchasePanel } from "./nft-edition-purchase-panel";
import { NftGallery } from "./nft-gallery";
import { RelatedNfts } from "./related-nfts";

type NftDetailContentProps = {
  readonly nft: NftDetail;
};

export function NftDetailContent({
  nft,
}: NftDetailContentProps) {
  const initialEdition =
    nft.editions.find(
      (edition) =>
        edition.name === "1/50" &&
        edition.availableQuantity > 0,
    ) ??
    nft.editions.find(
      (edition) => edition.availableQuantity > 0,
    ) ??
    nft.editions[0];
  const [selectedEditionId, setSelectedEditionId] =
    useState(initialEdition?.id ?? "");
  const [shareMessage, setShareMessage] =
    useState("");
  const favorite = useToggleFavorite(nft);

  async function handleCopyNftLink() {
    try {
      await navigator.clipboard.writeText(
        window.location.href,
      );
      setShareMessage("Link do NFT copiado.");
    } catch {
      setShareMessage(
        "Não foi possível copiar o link automaticamente.",
      );
    }
  }

  const metadata = (
    <div className="space-y-4">
      <dl className="space-y-3 text-sm text-muted-foreground md:space-y-2">
        <div className="flex flex-wrap gap-2">
          <dt>ID do token:</dt>
          <dd>{nft.tokenId}</dd>
        </div>
        <div className="flex flex-wrap gap-2">
          <dt>Coleção:</dt>
          <dd>{nft.collectionName}</dd>
        </div>
        <div className="flex flex-wrap gap-2">
          <dt>Atributos:</dt>
          <dd>{nft.attributes.join(", ")}</dd>
        </div>
      </dl>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        title="Copiar link do NFT"
        className="px-0"
        onClick={() => void handleCopyNftLink()}
      >
        {shareMessage === "Link do NFT copiado." ? (
          <Check aria-hidden="true" />
        ) : (
          <Share2 aria-hidden="true" />
        )}
        Copiar link do NFT
      </Button>

      {shareMessage && (
        <p
          role="status"
          className="text-xs text-primary"
        >
          {shareMessage}
        </p>
      )}
    </div>
  );

  return (
    <section
      className="py-4 md:py-8"
      aria-labelledby="nft-detail-title"
    >
      <nav
        aria-label="Navegação estrutural"
        className="mb-5 hidden text-sm font-semibold md:flex md:gap-2"
      >
        <Link
          to="/"
          search={{}}
          className="outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
        >
          Início
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          to="/"
          search={{}}
          hash="catalog"
          className="outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
        >
          Mercado
        </Link>
      </nav>

      <div className="relative -mx-3 overflow-hidden rounded-[2rem] bg-card md:mx-0 md:overflow-visible md:rounded-none md:bg-transparent">
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 md:hidden">
          <Link
            to="/"
            search={{}}
            aria-label="Voltar ao mercado"
            className="grid size-9 place-items-center rounded-full border border-primary/20 bg-background/65 text-primary backdrop-blur outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
          </Link>

          <Button
            type="button"
            variant="ghost"
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
            className="rounded-full border border-primary/20 bg-background/65 text-primary backdrop-blur"
            onClick={favorite.toggleFavorite}
          >
            <Heart
              aria-hidden="true"
              className={cn(
                nft.isFavorite && "fill-primary",
              )}
            />
          </Button>
        </div>

        <div className="md:grid md:grid-cols-[minmax(0,1.05fr)_minmax(21rem,0.95fr)] md:items-start md:gap-8 lg:gap-12">
          <NftGallery
            editions={nft.editions}
            images={nft.gallery}
            nftName={nft.name}
            selectedEditionId={selectedEditionId}
            onEditionChange={setSelectedEditionId}
          />

          <div className="relative -mt-8 space-y-5 rounded-t-[2rem] bg-card p-5 md:sticky md:top-6 md:mt-0 md:space-y-6 md:rounded-none md:bg-transparent md:p-0">
            <header className="flex items-start justify-between gap-4">
              <h1
                id="nft-detail-title"
                className="text-xl font-bold tracking-tight md:text-3xl"
              >
                {nft.name}
              </h1>

              <div className="flex shrink-0 items-center gap-1 rounded-full border border-primary px-2 py-1 text-xs md:text-sm">
                <Star
                  aria-hidden="true"
                  className="size-3 fill-primary text-primary md:size-4"
                />
                <span>{nft.rating}</span>
                <span className="text-muted-foreground">
                  ({nft.reviewCount})
                </span>
              </div>
            </header>

            <div className="space-y-2">
              <h2 className="hidden font-semibold md:block">
                Sobre este NFT:
              </h2>
              <p className="leading-7 text-muted-foreground">
                {nft.description}
              </p>
            </div>

            <NftEditionPurchasePanel
              nftId={nft.id}
              editions={nft.editions}
              isFavorite={nft.isFavorite}
              isFavoritePending={favorite.isPending}
              selectedEditionId={selectedEditionId}
              onEditionChange={setSelectedEditionId}
              onFavorite={favorite.toggleFavorite}
            >
              {metadata}
            </NftEditionPurchasePanel>

            {favorite.error && (
              <p
                role="alert"
                className="text-sm text-destructive"
              >
                {getFavoriteErrorMessage(favorite.error)}
              </p>
            )}
          </div>
        </div>
      </div>

      <NftDetailTabs nft={nft} />
      <RelatedNfts nfts={nft.relatedNfts} />
    </section>
  );
}
