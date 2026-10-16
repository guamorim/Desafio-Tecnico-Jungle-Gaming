import { Link } from "@tanstack/react-router";

import type { NftSummary } from "../types";

type RelatedNftsProps = {
  readonly nfts: readonly NftSummary[];
};

export function RelatedNfts({ nfts }: RelatedNftsProps) {
  if (nfts.length === 0) {
    return null;
  }

  return (
    <section
      className="mt-10 md:mt-16"
      aria-labelledby="related-nfts-title"
    >
      <h2
        id="related-nfts-title"
        className="border-b pb-3 text-lg font-bold text-primary"
      >
        Mais desta coleção
      </h2>

      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 py-6 sm:mx-0 sm:px-0 md:gap-5">
        {nfts.map((nft) => (
          <Link
            key={nft.id}
            to="/nfts/$nftId"
            params={{ nftId: nft.id }}
            className="group w-40 shrink-0 snap-start outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-44"
          >
            <article>
              <div className="aspect-square overflow-hidden rounded-lg bg-card p-1.5">
                <img
                  src={nft.imageUrl}
                  alt={`Obra ${nft.name}`}
                  width={480}
                  height={480}
                  loading="lazy"
                  decoding="async"
                  className="size-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-3 truncate font-medium">
                {nft.name}
              </h3>
              <p className="font-bold text-primary">
                {nft.startingPriceEth} ETH
              </p>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
