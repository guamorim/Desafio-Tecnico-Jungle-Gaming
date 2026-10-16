import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { nftListQueryOptions } from "@/features/nfts/queries/nft-list-query";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { data, isPending, isError, refetch } = useQuery(
    nftListQueryOptions,
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
    <main className="grid min-h-svh place-items-center bg-background px-6 text-foreground">
      <section className="flex max-w-xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Jungle NFT Marketplace
        </h1>

        <p className="text-muted-foreground">
          {data.pagination.totalItems} NFTs available
        </p>
      </section>
    </main>
  );
}
