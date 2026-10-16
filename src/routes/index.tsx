import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { HomeHero } from "@/components/home/home-hero";
import { FeaturedNftCard } from "@/components/home/featured-nft-card";
import { HomeEditorialSections } from "@/components/home/home-editorial-sections";
import { DesktopHomeHeader } from "@/components/layout/desktop-home-header";
import { MobileHomeHeader } from "@/components/layout/mobile-home-header";
import { Button } from "@/components/ui/button";
import { getGuestOwnerId } from "@/features/cart/guest-owner";
import { cartQueryOptions } from "@/features/cart/queries/cart-query";
import type {
  NftCatalogSort,
  NftCatalogTab,
} from "@/features/nfts/catalog-filters";
import {
  type NftCatalogFilters,
  validateNftCatalogSearch,
} from "@/features/nfts/catalog-search";
import { DesktopCatalogFilters } from "@/features/nfts/components/desktop-catalog-filters";
import { NftCatalogEmptyState } from "@/features/nfts/components/nft-catalog-empty-state";
import { MobileCatalogFilters } from "@/features/nfts/components/mobile-catalog-filters";
import { NftCatalogPagination } from "@/features/nfts/components/nft-catalog-pagination";
import { NftCatalogSkeleton } from "@/features/nfts/components/nft-catalog-skeleton";
import { NftCatalogSortSelect } from "@/features/nfts/components/nft-catalog-sort";
import { NftCatalogTabs } from "@/features/nfts/components/nft-catalog-tabs";
import { NftCard } from "@/features/nfts/components/nft-card";
import { nftListQueryOptions } from "@/features/nfts/queries/nft-list-query";

export const Route = createFileRoute("/")({
  validateSearch: validateNftCatalogSearch,
  component: HomePage,
});

function HomePage() {
  const catalogSearch = Route.useSearch();
  const navigate = Route.useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [cartOwnerId] = useState(getGuestOwnerId);

  const { data: cart } = useQuery(
    cartQueryOptions(cartOwnerId),
  );

  const {
    data,
    isPending,
    isError,
    refetch,
  } = useQuery(
    nftListQueryOptions(catalogSearch),
  );

  const cartItemCount =
    cart?.items.reduce(
      (total, item) => total + item.quantity,
      0,
    ) ?? 0;

  function handleSearchSubmit(searchValue: string) {
    const normalizedSearch = searchValue
      .trim()
      .slice(0, 80);

    void navigate({
      search: (currentSearch) => ({
        ...currentSearch,
        q: normalizedSearch || undefined,
        page: undefined,
      }),
    });

    document
      .getElementById("catalog")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }

  function handleApplyFilters(
    filters: NftCatalogFilters,
  ) {
    void navigate({
      search: (currentSearch) => ({
        ...currentSearch,
        categories: filters.categories,
        network: filters.network,
        minimumPrice: filters.minimumPrice,
        maximumPrice: filters.maximumPrice,
        page: undefined,
      }),
    });

    document
      .getElementById("catalog")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }

  function handleSortChange(
    sort: NftCatalogSort,
  ) {
    void navigate({
      search: (currentSearch) => ({
        ...currentSearch,
        sort:
          sort === "recent"
            ? undefined
            : sort,
        page: undefined,
      }),
    });
  }

  function handleTabChange(
    tab: NftCatalogTab,
  ) {
    void navigate({
      search: (currentSearch) => ({
        ...currentSearch,
        tab:
          tab === "all"
            ? undefined
            : tab,
        page: undefined,
      }),
    });
  }

  let catalogContent: ReactNode;
  let catalogDescription: string;

  if (isPending) {
    catalogDescription =
      "Carregando a seleção de NFTs...";

    catalogContent = <NftCatalogSkeleton />;
  } else if (isError) {
    catalogDescription =
      "Não foi possível carregar o catálogo.";

    catalogContent = (
      <section className="grid min-h-72 place-items-center text-center">
        <div className="flex flex-col items-center gap-4">
          <p role="alert">
            Não foi possível carregar os NFTs.
          </p>

          <Button onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </div>
      </section>
    );
  } else {
    catalogDescription =
      `Explore ${data.pagination.totalItems} itens digitais de criadores independentes.`;

    catalogContent =
      data.items.length === 0 ? (
        <NftCatalogEmptyState />
      ) : (
        <>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      );
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <DesktopHomeHeader
        key={`desktop-${catalogSearch.q ?? ""}`}
        cartItemCount={cartItemCount}
        initialSearchValue={catalogSearch.q ?? ""}
        onSearchSubmit={handleSearchSubmit}
      />

      <MobileHomeHeader
        key={catalogSearch.q ?? ""}
        initialSearchValue={catalogSearch.q ?? ""}
        isFilterOpen={isFilterOpen}
        onOpenFilters={() => {
          setIsFilterOpen(true);
        }}
        onSearchSubmit={handleSearchSubmit}
      />

      <MobileCatalogFilters
        open={isFilterOpen}
        search={catalogSearch}
        onApply={handleApplyFilters}
        onOpenChange={setIsFilterOpen}
      />

      <HomeHero />

      <section
        id="catalog"
        className="mx-auto w-full max-w-7xl scroll-mt-8 px-6 py-12 sm:py-16 lg:px-8"
        aria-labelledby="catalog-title"
      >
        <header className="mb-8 max-w-2xl space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Mercado curado
          </p>

          <h2
            id="catalog-title"
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Descubra NFTs extraordinários
          </h2>

          <p className="text-muted-foreground">
            {catalogDescription}
          </p>
        </header>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <NftCatalogTabs
            value={catalogSearch.tab ?? "all"}
            onValueChange={handleTabChange}
          />

          <NftCatalogSortSelect
            value={catalogSearch.sort ?? "recent"}
            onValueChange={handleSortChange}
          />
        </div>

        <div
          id="nft-catalog-results"
          role="tabpanel"
          aria-labelledby={`catalog-tab-${catalogSearch.tab ?? "all"}`}
          tabIndex={0}
        >
          <div className="grid items-start gap-8 md:grid-cols-[14rem_minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)]">
            <aside
              aria-label="Filtros e NFT em destaque"
              className="hidden space-y-6 md:block"
            >
              <DesktopCatalogFilters
                search={catalogSearch}
                onApply={handleApplyFilters}
              />
              <FeaturedNftCard />
            </aside>

            <div className="min-w-0">
              {catalogContent}
            </div>
          </div>
        </div>
      </section>

      <HomeEditorialSections />
    </main>
  );
}
