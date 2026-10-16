import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import type { NftDetail } from "../types";

type NftDetailContentProps = {
  readonly nft: NftDetail;
};

export function NftDetailContent({
  nft,
}: NftDetailContentProps) {
  return (
    <section
      className="py-8 md:py-12"
      aria-labelledby="nft-detail-title"
    >
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Voltar ao mercado
      </Link>

      <div className="grid gap-8 md:grid-cols-2 md:items-start lg:gap-14">
        <div className="aspect-square overflow-hidden rounded-3xl border bg-muted">
          <img
            src={nft.gallery[0] ?? nft.imageUrl}
            alt={`Obra ${nft.name}`}
            width={960}
            height={960}
            decoding="async"
            fetchPriority="high"
            className="size-full object-cover"
          />
        </div>

        <div className="space-y-8 md:sticky md:top-8">
          <header className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              {nft.collectionName}
            </p>

            <h1
              id="nft-detail-title"
              className="text-4xl font-semibold tracking-tight sm:text-5xl"
            >
              {nft.name}
            </h1>

            <p className="text-muted-foreground">
              Criado por {nft.creatorName}
            </p>
          </header>

          <p className="max-w-prose leading-7 text-muted-foreground">
            {nft.description}
          </p>

          <dl className="grid grid-cols-2 gap-4 border-y py-6">
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Rede
              </dt>
              <dd className="font-medium capitalize">
                {nft.network}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Disponibilidade
              </dt>
              <dd className="font-medium">
                {nft.availableQuantity} unidades
              </dd>
            </div>
          </dl>

          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Preço inicial
            </p>
            <p className="mt-1 text-3xl font-semibold text-primary">
              {nft.startingPriceEth} ETH
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
