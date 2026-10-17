import { NftCardSkeleton } from "./nft-card-skeleton";

const skeletonIds = Array.from(
  { length: 9 },
  (_, index) => `nft-card-skeleton-${index}`,
);

export function NftCatalogSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">
        Carregando NFTs...
      </span>

      <ul
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        aria-hidden="true"
      >
        {skeletonIds.map((skeletonId) => (
          <li key={skeletonId}>
            <NftCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}
