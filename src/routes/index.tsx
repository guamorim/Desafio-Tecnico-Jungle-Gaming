import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { validateNftCatalogSearch } from "@/features/nfts/catalog-search";
import { NftCatalogEmptyState } from "@/features/nfts/components/nft-catalog-empty-state";
import { NftCatalogPagination } from "@/features/nfts/components/nft-catalog-pagination";
import { NftCard } from "@/features/nfts/components/nft-card";
import { nftListQueryOptions } from "@/features/nfts/queries/nft-list-query";

export const Route = createFileRoute("/")({
  validateSearch: validateNftCatalogSearch,
  component: HomePage,
});

function HomePage() {
  const catalogSearch = Route.useSearch();

  const {
    data,
    isPending,
    isError,
    refetch,
  } = useQuery(
    nftListQueryOptions(catalogSearch),
  );

  if (isPending) {
    return (
      <main className="grid min-h-svh place-items-center bg-background px-6 text-foreground">
        <p className="text-sm text-muted-foreground" role="status">
          Loading NFTs...
        </p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="grid min-h-svh place-items-center bg-background px-6 text-foreground">
        <section className="flex flex-col items-center gap-4 text-center">
          <p role="alert">Unable to load NFTs.</p>

          <Button onClick={() => void refetch()}>
            Try again
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <section
        className="mx-auto w-full max-w-7xl px-6 py-12 sm:py-16 lg:px-8"
        aria-labelledby="catalog-title"
      >
        <header className="mb-8 max-w-2xl space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Curated NFT marketplace
          </p>

          <h1
            id="catalog-title"
            className="text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            Jungle NFT Marketplace
          </h1>

          <p className="text-muted-foreground">
            Explore {data.pagination.totalItems} digital collectibles from
            independent creators.
          </p>
        </header>

        {data.items.length === 0 ? (
          <NftCatalogEmptyState />
        ) : (
          <>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.items.map((nft) => (
                <li key={nft.id}>
                  <NftCard nft={nft} />
                </li>
              ))}
            </ul>

            <NftCatalogPagination
              pagination={data.pagination}
              search={catalogSearch}
            />
          </>
        )}
      </section>
    </main>
  );
}
