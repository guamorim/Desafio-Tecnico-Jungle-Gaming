import { useState } from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

import type { NftDetail } from "../types";

type NftDetailTabsProps = {
  readonly nft: NftDetail;
};

type DetailTab = "details" | "reviews";

export function NftDetailTabs({
  nft,
}: NftDetailTabsProps) {
  const [activeTab, setActiveTab] =
    useState<DetailTab>("details");
  const networkLabel =
    nft.network === "ethereum"
      ? "Ethereum"
      : nft.network === "polygon"
        ? "Polygon"
        : "Solana";

  return (
    <section className="mt-10 md:mt-20">
      <div
        role="tablist"
        aria-label="Informações do NFT"
        className="flex gap-3 overflow-x-auto border-b md:gap-6"
      >
        <button
          type="button"
          role="tab"
          id="nft-details-tab"
          aria-controls="nft-details-panel"
          aria-selected={activeTab === "details"}
          className={cn(
            "shrink-0 border-b-2 px-1 pb-3 text-left font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
            activeTab === "details"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setActiveTab("details")}
        >
          Detalhes do NFT
        </button>

        <button
          type="button"
          role="tab"
          id="nft-reviews-tab"
          aria-controls="nft-reviews-panel"
          aria-selected={activeTab === "reviews"}
          className={cn(
            "shrink-0 border-b-2 px-1 pb-3 text-left font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
            activeTab === "reviews"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setActiveTab("reviews")}
        >
          <span className="md:hidden">
            Avaliações ({nft.reviewCount})
          </span>
          <span className="hidden md:inline">
            Avaliações de colecionadores ({nft.reviewCount})
          </span>
        </button>
      </div>

      {activeTab === "details" ? (
        <div
          role="tabpanel"
          id="nft-details-panel"
          aria-labelledby="nft-details-tab"
          className="space-y-5 py-6 text-sm leading-7 text-muted-foreground md:text-base"
        >
          <p>
            {nft.name} é uma obra digital da coleção {nft.collectionName}.
            Cada atributo fica armazenado nos metadados do token e é
            verificado na rede {networkLabel}. A obra explora identidade,
            movimento e luz em um mundo digital sem fronteiras.
          </p>

          <p>
            A propriedade inclui acesso à arte em alta resolução e
            um registro permanente da edição adquirida. O criador
            {` ${nft.creatorName} `}
            recebe {nft.royaltyPercentage}% de direitos autorais nas
            vendas secundárias, apoiando novos trabalhos e lançamentos
            da comunidade.
          </p>

          <dl className="space-y-4 border-t pt-5">
            <div className="space-y-1">
              <dt className="font-semibold text-foreground">Rede</dt>
              <dd>
                Cunhado na {networkLabel}, com procedência imutável e
                metadados armazenados no IPFS.
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="font-semibold text-foreground">Contrato</dt>
              <dd className="break-all">
                <span className="font-mono">{nft.contractAddress}</span>
                {" · "}
                Contrato inteligente ERC-721 verificado.
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="font-semibold text-foreground">
                Direitos autorais
              </dt>
              <dd>
                {nft.royaltyPercentage}% nas vendas secundárias, pagos
                automaticamente pelos mercados compatíveis.
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <div
          role="tabpanel"
          id="nft-reviews-panel"
          aria-labelledby="nft-reviews-tab"
          className="py-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <strong className="text-3xl text-foreground">
              {nft.rating}
            </strong>
            <div>
              <div className="flex text-primary" aria-hidden="true">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    className="size-4 fill-current"
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {nft.reviewCount} avaliações
              </p>
            </div>
          </div>

          <ul className="grid gap-4 md:grid-cols-2">
            {nft.reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-2xl border bg-card p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold">{review.authorName}</p>
                  <span className="flex items-center gap-1 text-sm text-primary">
                    <Star className="size-4 fill-current" aria-hidden="true" />
                    {review.rating}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {review.comment}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
