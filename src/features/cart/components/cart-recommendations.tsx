import { Link } from "@tanstack/react-router";

import { Skeleton } from "@/components/ui/skeleton";
import type { NftSummary } from "@/features/nfts/types";

type CartRecommendationsProps = {
  readonly isPending: boolean;
  readonly items: readonly NftSummary[];
};

export function CartRecommendations({
  isPending,
  items,
}: CartRecommendationsProps) {
  if (!isPending && items.length === 0) {
    return null;
  }

  return (
    <section
      className="mt-16 md:mt-24"
      aria-labelledby="cart-recommendations-title"
      aria-busy={isPending}
    >
      <h2
        id="cart-recommendations-title"
        className="border-b pb-3 text-lg font-bold text-primary"
      >
        Colecionadores também viram
      </h2>

      {isPending ? (
        <ul className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <li key={index}>
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="mt-3 h-4 w-4/5" />
              <Skeleton className="mt-2 h-4 w-2/5" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-5">
          {items.map((nft) => (
            <li key={nft.id}>
              <Link
                to="/nfts/$nftId"
                params={{ nftId: nft.id }}
                className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="aspect-square overflow-hidden rounded-xl bg-card">
                  <img
                    src={nft.imageUrl}
                    alt={`Arte do NFT ${nft.name}`}
                    width={480}
                    height={480}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="mt-3 min-w-0">
                  <h3 className="truncate text-sm">
                    {nft.name}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-primary">
                    {nft.startingPriceEth} ETH
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
